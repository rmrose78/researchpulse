from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.reading_list import SaveArticleRequest, SavedArticleResponse
from app.services import reading_list as reading_list_service

router = APIRouter(prefix="/api/reading-list", tags=["reading-list"])


@router.post("/", response_model=SavedArticleResponse, status_code=201)
async def save_article(request: SaveArticleRequest, db: Session = Depends(get_db)):
    return await reading_list_service.save_article(db, request)


@router.get("/", response_model=list[SavedArticleResponse])
async def get_saved_articles(db: Session = Depends(get_db)):
    return await reading_list_service.list_saved_articles(db)


@router.delete("/{pmid}", status_code=204)
async def delete_saved_article(pmid: str, db: Session = Depends(get_db)):
    await reading_list_service.remove_saved_article(db, pmid)
