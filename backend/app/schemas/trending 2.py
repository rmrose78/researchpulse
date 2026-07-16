from datetime import datetime
from pydantic import BaseModel
from app.schemas.pubmed import ArticleSearchResult


class TrendingArticle(ArticleSearchResult):
    citation_count: int
    velocity: float


class TrendingResponse(BaseModel):
    specialty: str
    window_days: int
    computed_at: datetime
    results: list[TrendingArticle]


class TrendingAvailabilityResponse(BaseModel):
    window_days: int
    available: dict[str, bool]
