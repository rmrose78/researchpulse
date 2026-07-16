import asyncio
from datetime import date, datetime, timedelta, timezone
from datetime import datetime as dt
import httpx
from sqlalchemy.orm import Session
from app.database import sessionLocal
from app.models.trending import TrendingSnapshot
from app.schemas.pubmed import ArticleSearchResult
from app.schemas.trending import TrendingArticle
from app.services.pubmed import pubmed_service
from app.services.semantic_scholar import semantic_scholar_service
from app.services.specialties import SPECIALTY_QUERIES

MODE = "trending"
CACHE_TTL = timedelta(hours=8)
# NCBI's efetch (GET, comma-joined ids) starts hitting URL-length limits well
# before Semantic Scholar's own batch cap — 200 is comfortably under both.
POOL_SIZE = 200
# The user-selectable time ranges (frontend dropdown) — 60 days, 6 months,
# 1 year, 2 years. `get_trending` rejects any other value.
VALID_WINDOW_DAYS = {60, 180, 365, 730}
DEFAULT_WINDOW_DAYS = 365
# PubMed's esearch always returns newest-first, so a single query over a wide
# window only ever samples its freshest slice — articles too new to have any
# Semantic Scholar citation linkage yet. Splitting the selected window into
# ~90-day slices and sampling from each one gives older-in-window articles
# (which have had time to accrue citations) real representation, however
# wide the window is.
SLICE_LENGTH_DAYS = 90
# Velocity smoothing constant — keeps very-new articles from dividing by a
# near-zero age and dominating the ranking on a single early citation.
VELOCITY_AGE_SMOOTHING_DAYS = 21


class UnknownSpecialtyError(ValueError):
    pass


class InvalidWindowError(ValueError):
    pass


# --- Pure ranking helpers (no I/O) -----------------------------------------

def _parse_month(month_str: str) -> int | None:
    month_str = month_str.strip()
    if month_str.isdigit():
        month = int(month_str)
        return month if 1 <= month <= 12 else None
    for fmt in ("%b", "%B"):
        try:
            return dt.strptime(month_str, fmt).month
        except ValueError:
            continue
    return None


def _parse_pub_date(pub_date: str | None) -> date | None:
    if not pub_date:
        return None
    parts = pub_date.split("/")
    if len(parts) < 2 or not parts[0].isdigit():
        return None
    month = _parse_month(parts[1])
    if month is None:
        return None
    return date(int(parts[0]), month, 1)


def age_days(pub_date: str | None, today: date) -> int | None:
    parsed = _parse_pub_date(pub_date)
    if parsed is None:
        return None
    return max((today - parsed).days, 0)


def compute_velocity(citation_count: int, age_in_days: int) -> float:
    return citation_count / (age_in_days + VELOCITY_AGE_SMOOTHING_DAYS)


def rank_articles(
    articles: list[ArticleSearchResult], citation_counts: dict[str, int], today: date
) -> list[TrendingArticle]:
    ranked: list[TrendingArticle] = []
    for article in articles:
        count = citation_counts.get(article.pmid)
        if not count:
            continue
        days = age_days(article.pub_date, today)
        if days is None:
            continue
        ranked.append(
            TrendingArticle(
                **article.model_dump(),
                citation_count=count,
                velocity=compute_velocity(count, days),
            )
        )
    ranked.sort(key=lambda a: a.velocity, reverse=True)
    return ranked


def is_stale(snapshot: TrendingSnapshot, now: datetime) -> bool:
    computed_at = snapshot.computed_at
    if computed_at.tzinfo is None:
        computed_at = computed_at.replace(tzinfo=timezone.utc)
    return now - computed_at > CACHE_TTL


def window_slices(today: date, window_days: int) -> list[tuple[str, str]]:
    """Split [today - window_days, today] into ~SLICE_LENGTH_DAYS-long date
    ranges (formatted for PubMed's date filter), oldest slice last."""
    num_slices = max(1, round(window_days / SLICE_LENGTH_DAYS))
    slice_length = window_days / num_slices
    slices = []
    for i in range(num_slices):
        end_offset = round(i * slice_length)
        start_offset = round((i + 1) * slice_length)
        date_to = (today - timedelta(days=end_offset)).strftime("%Y/%m/%d")
        date_from = (today - timedelta(days=start_offset)).strftime("%Y/%m/%d")
        slices.append((date_from, date_to))
    return slices


# --- PubMed pool + citation lookup ------------------------------------------

async def _rank_for_window(
    mesh_query: str, client: httpx.AsyncClient, today: date, window_days: int
) -> list[TrendingArticle]:
    slices = window_slices(today, window_days)
    per_slice = max(1, POOL_SIZE // len(slices))

    all_articles: list[ArticleSearchResult] = []
    seen_pmids: set[str] = set()
    for date_from, date_to in slices:
        response = await pubmed_service.search(
            query=mesh_query,
            max_results=per_slice,
            date_from=date_from,
            date_to=date_to,
            client=client,
        )
        for article in response.results:
            if article.pmid not in seen_pmids:
                seen_pmids.add(article.pmid)
                all_articles.append(article)

    pmids = [article.pmid for article in all_articles]
    citation_counts = await semantic_scholar_service.get_citation_counts(client, pmids)
    return rank_articles(all_articles, citation_counts, today)


async def _fetch_ranked(
    specialty: str, client: httpx.AsyncClient, window_days: int, today: date
) -> list[TrendingArticle]:
    mesh_query = SPECIALTY_QUERIES[specialty]
    return await _rank_for_window(mesh_query, client, today, window_days)


# --- Cache read/write + single-flight refresh --------------------------------

_locks: dict[str, asyncio.Lock] = {}


def _lock_for(specialty: str, window_days: int) -> asyncio.Lock:
    key = f"{specialty}:{window_days}"
    if key not in _locks:
        _locks[key] = asyncio.Lock()
    return _locks[key]


def _latest_snapshot(db: Session, specialty: str, window_days: int) -> TrendingSnapshot | None:
    return (
        db.query(TrendingSnapshot)
        .filter(
            TrendingSnapshot.specialty == specialty,
            TrendingSnapshot.mode == MODE,
            TrendingSnapshot.window_days == window_days,
        )
        .order_by(TrendingSnapshot.computed_at.desc())
        .first()
    )


async def _compute_and_store(
    db: Session, client: httpx.AsyncClient, specialty: str, window_days: int
) -> TrendingSnapshot:
    today = datetime.now(timezone.utc).date()
    ranked = await _fetch_ranked(specialty, client, window_days, today)
    snapshot = TrendingSnapshot(
        specialty=specialty,
        mode=MODE,
        window_days=window_days,
        payload=[article.model_dump(mode="json") for article in ranked],
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot


async def _background_refresh(specialty: str, window_days: int, client: httpx.AsyncClient) -> None:
    lock = _lock_for(specialty, window_days)
    if lock.locked():
        return
    async with lock:
        db = sessionLocal()
        try:
            await _compute_and_store(db, client, specialty, window_days)
        finally:
            db.close()


async def get_trending(
    db: Session, client: httpx.AsyncClient, specialty: str, window_days: int
) -> TrendingSnapshot:
    if specialty not in SPECIALTY_QUERIES:
        raise UnknownSpecialtyError(f"Unknown specialty '{specialty}'")
    if window_days not in VALID_WINDOW_DAYS:
        raise InvalidWindowError(f"Unsupported window_days '{window_days}'")

    latest = _latest_snapshot(db, specialty, window_days)

    if latest is None:
        # Cold cache — the very first request for this (specialty, window_days)
        # blocks on a live computation, guarded by a per-key single-flight
        # lock so concurrent cold requests only compute once.
        lock = _lock_for(specialty, window_days)
        async with lock:
            latest = _latest_snapshot(db, specialty, window_days)
            if latest is None:
                latest = await _compute_and_store(db, client, specialty, window_days)
        return latest

    if is_stale(latest, datetime.now(timezone.utc)):
        # Stale-while-revalidate — serve the last good snapshot immediately,
        # refresh in the background rather than blocking this request.
        asyncio.create_task(_background_refresh(specialty, window_days, client))

    return latest


def list_cached_availability(db: Session, window_days: int) -> dict[str, bool]:
    """Cache-only lookup (no external calls): which specialties are already
    known, from a previously computed snapshot, to have zero qualifying
    results at this window_days. A specialty with no cached row yet is
    simply omitted — callers should treat "missing" as "not yet known",
    not "has results"."""
    rows = (
        db.query(TrendingSnapshot.specialty, TrendingSnapshot.payload)
        .filter(TrendingSnapshot.mode == MODE, TrendingSnapshot.window_days == window_days)
        .order_by(TrendingSnapshot.specialty, TrendingSnapshot.computed_at.desc())
        .all()
    )
    availability: dict[str, bool] = {}
    for specialty, payload in rows:
        if specialty not in availability:
            availability[specialty] = len(payload) > 0
    return availability
