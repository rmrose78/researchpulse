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
# Within a recency-bounded pool only a small fraction of articles have
# accrued any citations yet, so a much smaller pool starves the ranking.
POOL_SIZE = 200
DEFAULT_WINDOW_DAYS = 180
WIDENED_WINDOW_DAYS = 365
MIN_QUALIFYING_RESULTS = 5
# Velocity smoothing constant — keeps very-new articles from dividing by a
# near-zero age and dominating the ranking on a single early citation.
VELOCITY_AGE_SMOOTHING_DAYS = 14


class UnknownSpecialtyError(ValueError):
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


# --- PubMed pool + citation lookup ------------------------------------------

async def _rank_for_window(
    mesh_query: str, client: httpx.AsyncClient, today: date, window_days: int
) -> list[TrendingArticle]:
    date_from = (today - timedelta(days=window_days)).strftime("%Y/%m/%d")
    date_to = today.strftime("%Y/%m/%d")
    response = await pubmed_service.search(
        query=mesh_query,
        max_results=POOL_SIZE,
        date_from=date_from,
        date_to=date_to,
        client=client,
    )
    pmids = [article.pmid for article in response.results]
    citation_counts = await semantic_scholar_service.get_citation_counts(client, pmids)
    return rank_articles(response.results, citation_counts, today)


async def _fetch_ranked(
    specialty: str, client: httpx.AsyncClient, today: date
) -> list[TrendingArticle]:
    mesh_query = SPECIALTY_QUERIES[specialty]
    ranked = await _rank_for_window(mesh_query, client, today, DEFAULT_WINDOW_DAYS)
    if len(ranked) < MIN_QUALIFYING_RESULTS:
        # Minimum-results fallback — a quiet specialty's 180-day pool can be
        # too thin to qualify; widen the window rather than render near-empty.
        ranked = await _rank_for_window(mesh_query, client, today, WIDENED_WINDOW_DAYS)
    return ranked


# --- Cache read/write + single-flight refresh --------------------------------

_locks: dict[str, asyncio.Lock] = {}


def _lock_for(specialty: str) -> asyncio.Lock:
    if specialty not in _locks:
        _locks[specialty] = asyncio.Lock()
    return _locks[specialty]


def _latest_snapshot(db: Session, specialty: str) -> TrendingSnapshot | None:
    return (
        db.query(TrendingSnapshot)
        .filter(TrendingSnapshot.specialty == specialty, TrendingSnapshot.mode == MODE)
        .order_by(TrendingSnapshot.computed_at.desc())
        .first()
    )


async def _compute_and_store(
    db: Session, client: httpx.AsyncClient, specialty: str
) -> TrendingSnapshot:
    today = datetime.now(timezone.utc).date()
    ranked = await _fetch_ranked(specialty, client, today)
    snapshot = TrendingSnapshot(
        specialty=specialty,
        mode=MODE,
        payload=[article.model_dump(mode="json") for article in ranked],
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot


async def _background_refresh(specialty: str, client: httpx.AsyncClient) -> None:
    lock = _lock_for(specialty)
    if lock.locked():
        return
    async with lock:
        db = sessionLocal()
        try:
            await _compute_and_store(db, client, specialty)
        finally:
            db.close()


async def get_trending(db: Session, client: httpx.AsyncClient, specialty: str) -> TrendingSnapshot:
    if specialty not in SPECIALTY_QUERIES:
        raise UnknownSpecialtyError(f"Unknown specialty '{specialty}'")

    latest = _latest_snapshot(db, specialty)

    if latest is None:
        # Cold cache — the very first request for this specialty blocks on a
        # live computation, guarded by a per-specialty single-flight lock so
        # concurrent cold requests only compute once.
        lock = _lock_for(specialty)
        async with lock:
            latest = _latest_snapshot(db, specialty)
            if latest is None:
                latest = await _compute_and_store(db, client, specialty)
        return latest

    if is_stale(latest, datetime.now(timezone.utc)):
        # Stale-while-revalidate — serve the last good snapshot immediately,
        # refresh in the background rather than blocking this request.
        asyncio.create_task(_background_refresh(specialty, client))

    return latest
