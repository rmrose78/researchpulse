from datetime import date
from unittest.mock import AsyncMock, patch
import pytest
from app.schemas.pubmed import ArticleSearchResult, SearchResponse
from app.services import trending as trending_service


def _make_articles(n: int) -> list[ArticleSearchResult]:
    return [
        ArticleSearchResult(
            pmid=str(i), title=f"Article {i}", abstract=None, authors=[],
            journal=None, pub_date="2024/Jan", doi=None,
        )
        for i in range(n)
    ]


@pytest.mark.asyncio
async def test_fetch_ranked_widens_window_when_pool_too_thin():
    # Arrange — narrow window (180d) barely qualifies anyone, widened (365d) does
    narrow_articles = _make_articles(2)
    wide_articles = _make_articles(10)

    async def fake_search(query, max_results, date_from, date_to, client):
        span_days = (
            date.today() - date.fromisoformat(date_from.replace("/", "-"))
        ).days
        articles = wide_articles if span_days > trending_service.DEFAULT_WINDOW_DAYS else narrow_articles
        return SearchResponse(total=len(articles), results=articles, query=query)

    async def fake_citation_counts(client, pmids):
        return {pmid: 5 for pmid in pmids}

    with patch.object(trending_service.pubmed_service, "search", side_effect=fake_search), \
         patch.object(
             trending_service.semantic_scholar_service,
             "get_citation_counts",
             side_effect=fake_citation_counts,
         ):
        # Act
        ranked = await trending_service._fetch_ranked("cardiology", AsyncMock(), date.today())

    # Assert — fell through to the widened pool since narrow only had 2 (< MIN_QUALIFYING_RESULTS)
    assert len(ranked) == 10


@pytest.mark.asyncio
async def test_fetch_ranked_keeps_narrow_window_when_it_has_enough_results():
    # Arrange — narrow window already meets the minimum, so no widening needed
    narrow_articles = _make_articles(trending_service.MIN_QUALIFYING_RESULTS)

    async def fake_search(query, max_results, date_from, date_to, client):
        return SearchResponse(total=len(narrow_articles), results=narrow_articles, query=query)

    call_count = 0

    async def fake_citation_counts(client, pmids):
        nonlocal call_count
        call_count += 1
        return {pmid: 5 for pmid in pmids}

    with patch.object(trending_service.pubmed_service, "search", side_effect=fake_search), \
         patch.object(
             trending_service.semantic_scholar_service,
             "get_citation_counts",
             side_effect=fake_citation_counts,
         ):
        # Act
        ranked = await trending_service._fetch_ranked("cardiology", AsyncMock(), date.today())

    # Assert — only one window was tried
    assert len(ranked) == trending_service.MIN_QUALIFYING_RESULTS
    assert call_count == 1
