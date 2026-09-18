from fastapi import APIRouter, HTTPException, Query

from app.location.geocoding import (
    LocationSearchError,
    search_locations,
)


router = APIRouter(
    prefix="/api/location",
    tags=["Location"],
)


@router.get("/search")
def search_location(
    q: str = Query(
        min_length=2,
        max_length=100,
    ),
):
    try:
        locations = search_locations(q)

        return {
            "query": q,
            "count": len(locations),
            "results": locations,
        }

    except LocationSearchError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc