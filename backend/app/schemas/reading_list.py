from pydantic import BaseModel
from datatime import datetime

class SaveArticleRequest(BaseModel):
    pmid: str
    title: str
    authors: list[str] = []
    journal: str | None = None
    pub_date: str | None = None
    doi: str | None = None

class SavedArticleResponse(BaseModel):
    id: int
    pmid: str
    title: str
    authors: str | None = None
    journal: str | None = None
    pub_date: str | None = None
    doi: str | None = None
    saved_at: datetime

    model_Config = {"from_attributes": True}