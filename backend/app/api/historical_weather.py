from fastapi import APIRouter, HTTPException

from app.schemas.historical_weather import (
    HistoricalClimateResult,
    HistoricalWeatherRequest,
)
from app.weather.historical import get_historical_climate


router = APIRouter(
    prefix="/api/weather",
    tags=["Historical Weather"],
)


@router.post(
    "/historical",
    response_model=HistoricalClimateResult,
)
async def historical_weather(
    request: HistoricalWeatherRequest,
) -> HistoricalClimateResult:
    """
    Fetch historical hourly weather and return a representative
    climate profile for the requested location and period.
    """
    try:
        return await get_historical_climate(request)

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Historical weather service failed: {exc}",
        ) from exc