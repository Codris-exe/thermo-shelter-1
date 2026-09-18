from fastapi import APIRouter, HTTPException, Query

from app.weather.open_meteo import (
    WeatherServiceError,
    get_forecast,
)


router = APIRouter(
    prefix="/api/weather",
    tags=["Weather"],
)


@router.get("/forecast")
def weather_forecast(
    latitude: float = Query(
        ge=-90,
        le=90,
    ),
    longitude: float = Query(
        ge=-180,
        le=180,
    ),
    hours: int = Query(
        default=24,
        ge=1,
        le=48,
    ),
):

    try:

        data = get_forecast(
            latitude=latitude,
            longitude=longitude,
            hours=hours,
        )

        return data

    except WeatherServiceError as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc