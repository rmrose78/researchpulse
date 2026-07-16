import asyncio
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock
import pytest
from app.database import sessionLocal
from app.models.trending import TrendingSnapshot
from app.services import trending as trending_service

SPECIALTY = "cardiology"


def _delete_snapshots(specialty: str = SPECIALTY):
    db = sessionLocal()
    db.query(TrendingSnapshot).filter(TrendingSnapshot.specialty == specialty).delete()
    db.commit()
    db.close()


@pytest.fixture(autouse=True)
def _clean_snapshots():
    _delete_snapshots()
    yield
    _delete_snapshots()


def _fake_ranked_article(pmid="1"):
    from app.schemas.trending import TrendingArticle

    return TrendingArticle(
        pmid=pmid, title="t", abstract=None, authors=[], journal=None,
        pub_date="2024/Jan", doi=None, citation_count=10, velocity=0.5,
    )


@pytest.mark.asyncio
async def test_get_trending_rejects_unknown_specialty():
    # Arrange
    db = sessionLocal()

    # Act & Assert
    with pytest.raises(trending_service.UnknownSpecialtyError):
        await trending_service.get_trending(db, AsyncMock(), "not_a_real_specialty")
    db.close()


@pytest.mark.asyncio
async def test_get_trending_computes_and_stores_on_cold_cache(monkeypatch):
    # Arrange
    mock_fetch = AsyncMock(return_value=[_fake_ranked_article()])
    monkeypatch.setattr(trending_service, "_fetch_ranked", mock_fetch)
    db = sessionLocal()

    # Act
    snapshot = await trending_service.get_trending(db, AsyncMock(), SPECIALTY)

    # Assert
    mock_fetch.assert_called_once()
    assert snapshot.specialty == SPECIALTY
    assert snapshot.payload[0]["pmid"] == "1"
    db.close()


@pytest.mark.asyncio
async def test_get_trending_serves_fresh_cache_without_recomputing(monkeypatch):
    # Arrange
    mock_fetch = AsyncMock(return_value=[_fake_ranked_article()])
    monkeypatch.setattr(trending_service, "_fetch_ranked", mock_fetch)
    db = sessionLocal()
    first = await trending_service.get_trending(db, AsyncMock(), SPECIALTY)

    # Act
    second = await trending_service.get_trending(db, AsyncMock(), SPECIALTY)

    # Assert
    mock_fetch.assert_called_once()
    assert second.id == first.id
    db.close()


@pytest.mark.asyncio
async def test_get_trending_schedules_background_refresh_when_stale(monkeypatch):
    # Arrange — insert an already-stale snapshot directly
    db = sessionLocal()
    stale_snapshot = TrendingSnapshot(
        specialty=SPECIALTY,
        mode="trending",
        computed_at=datetime.now(timezone.utc) - timedelta(hours=9),
        payload=[],
    )
    db.add(stale_snapshot)
    db.commit()

    mock_bg = AsyncMock()
    monkeypatch.setattr(trending_service, "_background_refresh", mock_bg)
    client = AsyncMock()

    # Act
    result = await trending_service.get_trending(db, client, SPECIALTY)
    await asyncio.sleep(0)  # let the scheduled task run

    # Assert — stale data served immediately, refresh kicked off separately
    assert result.id == stale_snapshot.id
    mock_bg.assert_called_once_with(SPECIALTY, client)
    db.close()


@pytest.mark.asyncio
async def test_get_trending_does_not_schedule_refresh_when_fresh(monkeypatch):
    # Arrange
    mock_fetch = AsyncMock(return_value=[_fake_ranked_article()])
    monkeypatch.setattr(trending_service, "_fetch_ranked", mock_fetch)
    mock_bg = AsyncMock()
    monkeypatch.setattr(trending_service, "_background_refresh", mock_bg)
    db = sessionLocal()
    await trending_service.get_trending(db, AsyncMock(), SPECIALTY)

    # Act
    await trending_service.get_trending(db, AsyncMock(), SPECIALTY)
    await asyncio.sleep(0)

    # Assert
    mock_bg.assert_not_called()
    db.close()


@pytest.mark.asyncio
async def test_concurrent_cold_cache_requests_only_compute_once(monkeypatch):
    # Arrange — simulate two requests racing on a specialty with no cache yet
    call_count = 0

    async def slow_fetch(specialty, client, today):
        nonlocal call_count
        call_count += 1
        await asyncio.sleep(0.02)
        return [_fake_ranked_article()]

    monkeypatch.setattr(trending_service, "_fetch_ranked", slow_fetch)
    db_a = sessionLocal()
    db_b = sessionLocal()

    # Act
    results = await asyncio.gather(
        trending_service.get_trending(db_a, AsyncMock(), SPECIALTY),
        trending_service.get_trending(db_b, AsyncMock(), SPECIALTY),
    )

    # Assert — single-flight lock means only one computation ran
    assert call_count == 1
    assert results[0].id == results[1].id
    db_a.close()
    db_b.close()
