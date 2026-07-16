import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.trending import TrendingResponse
from app.services import trending as trending_service

router = APIRouter(prefix="/api/trending", tags=["trending"])


@router.get("/", response_model=TrendingResponse)
async def get_trending(
    request: Request,
    specialty: str = Query(..., description="Specialty key, e.g. 'cardiology'"),
    db: Session = Depends(get_db),
):
    try:
        snapshot = await trending_service.get_trending(
            db, request.app.state.http_client, specialty
        )
    except trending_service.UnknownSpecialtyError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Trending data unavailable: {str(e)}")

    return TrendingResponse(
        specialty=snapshot.specialty,
        computed_at=snapshot.computed_at,
        results=snapshot.payload,
    )
