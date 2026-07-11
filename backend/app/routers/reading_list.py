from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.reading_list import SavedArticle
from app.schemas.reading_list import SaveArticleRequest, SavedArticleResponse

router = APIRouter(prefix="/api/reading-list", tags=["reading-list"])

@router.post("/", response_model=SavedArticleResponse, status_code=201)
def save_article(request: SaveArticleRequest, db: Session = Depends(get_db)):
    existing = db.query(SavedArticle).filter(SavedArticle.pmid == request.pmid).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Article {request.pmid} already saved")
    
    article = SavedArticle(
        pmid=request.pmid,
        title=request.title,
        authors=", ".join(request.authors) if request.authors else None,
        journal=request.journal,
        pub_date=request.pub_date,
        doi=request.doi,
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article

@router.get("/", response_model=list[SavedArticleResponse])
def get_saved_articles(db: Session = Depends(get_db)):
    return db.query(SavedArticle).order_by(SavedArticle.saved_at.desc()).all()

@router.delete("/{pmid}", status_code=204)
def delete_saved_article(pmid: str, db: Session = Depends(get_db)):
    article = db.query(SavedArticle).filter(SavedArticle.pmid == pmid).first()
    if article is None:
        raise HTTPException(status_code=404, detail=f"Article {pmid} not found in reading list")
    db.delete(article)
    db.commit()