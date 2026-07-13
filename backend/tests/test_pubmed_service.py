import httpx
import pytest
from unittest.mock import AsyncMock, patch
from app.services.pubmed import PubMedService

EMPTY_ESEARCH_XML = "<eSearchResult><Count>0</Count></eSearchResult>"


def _empty_esearch_response() -> httpx.Response:
    return httpx.Response(
        status_code=200,
        text=EMPTY_ESEARCH_XML,
        request=httpx.Request("GET", "https://testserver/esearch.fcgi"),
    )


async def _search_and_capture_term(**search_kwargs) -> str:
    service = PubMedService()
    with patch.object(
        service, "_get_with_retry", new=AsyncMock(return_value=_empty_esearch_response())
    ) as mock_get:
        await service.search(**search_kwargs)
    return mock_get.call_args.kwargs["params"]["term"]


@pytest.mark.asyncio
async def test_search_appends_journal_filter_to_term():
    # Arrange / Act
    term = await _search_and_capture_term(query="cardiac", journal="The Lancet")

    # Assert
    assert term == 'cardiac AND "The Lancet"[journal]'


@pytest.mark.asyncio
async def test_search_appends_date_range_when_both_dates_set():
    # Arrange / Act
    term = await _search_and_capture_term(
        query="cardiac", date_from="2024/01/01", date_to="2024/12/31"
    )

    # Assert
    assert term == "cardiac AND 2024/01/01:2024/12/31[Date - Publication]"


@pytest.mark.asyncio
async def test_search_ignores_single_sided_date_range():
    # Arrange / Act
    term = await _search_and_capture_term(query="cardiac", date_from="2024/01/01")

    # Assert
    assert term == "cardiac"


@pytest.mark.asyncio
async def test_search_combines_journal_and_date_filters():
    # Arrange / Act
    term = await _search_and_capture_term(
        query="cardiac",
        journal="The Lancet",
        date_from="2024/01/01",
        date_to="2024/12/31",
    )

    # Assert
    assert term == (
        'cardiac AND "The Lancet"[journal] AND 2024/01/01:2024/12/31[Date - Publication]'
    )
