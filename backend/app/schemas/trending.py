from datetime import datetime
from pydantic import BaseModel
from app.schemas.pubmed import ArticleSearchResult


class TrendingArticle(ArticleSearchResult):
    citation_count: int
    velocity: float
    notable_type: str | None = None
    rank_delta: int | None = None
    is_new: bool = False


class TrendingResponse(BaseModel):
    specialty: str
    mode: str
    window_days: int
    computed_at: datetime
    results: list[TrendingArticle]


class TrendingAvailabilityResponse(BaseModel):
    window_days: int
    mode: str
    available: dict[str, bool]
