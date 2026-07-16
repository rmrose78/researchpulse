import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.trending import TrendingAvailabilityResponse, TrendingResponse
from app.services import trending as trending_service

router = APIRouter(prefix="/api/trending", tags=["trending"])


@router.get("/", response_model=TrendingResponse)
async def get_trending(
    request: Request,
    specialty: str = Query(..., description="Specialty key, e.g. 'cardiology'"),
    window_days: int = Query(
        trending_service.DEFAULT_WINDOW_DAYS,
        description="Time range in days — one of 60, 180, 365, 730",
    ),
    db: Session = Depends(get_db),
):
    try:
        snapshot = await trending_service.get_trending(
            db, request.app.state.http_client, specialty, window_days
        )
    except trending_service.UnknownSpecialtyError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except trending_service.InvalidWindowError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Trending data unavailable: {str(e)}")

    return TrendingResponse(
        specialty=snapshot.specialty,
        window_days=snapshot.window_days,
        computed_at=snapshot.computed_at,
        results=snapshot.payload,
    )


@router.get("/availability", response_model=TrendingAvailabilityResponse)
async def get_trending_availability(
    window_days: int = Query(
        trending_service.DEFAULT_WINDOW_DAYS,
        description="Time range in days — one of 60, 180, 365, 730",
    ),
    db: Session = Depends(get_db),
):
    # Cache-only lookup — never triggers a PubMed/Semantic Scholar call, so
    # the frontend can call this freely (e.g. on every time-range change)
    # without any rate-limit risk.
    available = trending_service.list_cached_availability(db, window_days)
    return TrendingAvailabilityResponse(window_days=window_days, available=available)
