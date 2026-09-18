from typing import Any

import httpx


OPEN_METEO_FORECAST_URL = (
    "https://api.open-meteo.com/v1/forecast"
)


class WeatherServiceError(Exception):
    """Raised when the weather service fails."""


def get_forecast(
    latitude: float,
    longitude: float,
    hours: int = 24,
) -> dict[str, Any]:
    """
    Retrieve real hourly forecast weather and solar data.

    The returned data is normalized for Thermo Shelter.
    """

    if not -90 <= latitude <= 90:
        raise WeatherServiceError(
            "Latitude must be between -90 and 90."
        )

    if not -180 <= longitude <= 180:
        raise WeatherServiceError(
            "Longitude must be between -180 and 180."
        )

    if not 1 <= hours <= 48:
        raise WeatherServiceError(
            "Hours must be between 1 and 48."
        )

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ",".join(
            [
                "temperature_2m",
                "relative_humidity_2m",
                "wind_speed_10m",
                "wind_direction_10m",
                "shortwave_radiation",
                "direct_radiation",
                "diffuse_radiation",
                "direct_normal_irradiance",
                "cloud_cover",
                "is_day",
            ]
        ),
        "forecast_hours": hours,
        "temperature_unit": "celsius",
        "wind_speed_unit": "ms",
        "timezone": "auto",
    }

    try:
        with httpx.Client(timeout=20.0) as client:
            response = client.get(
                OPEN_METEO_FORECAST_URL,
                params=params,
            )

            response.raise_for_status()

    except httpx.HTTPError as exc:
        raise WeatherServiceError(
            "Unable to retrieve weather data."
        ) from exc

    data = response.json()

    hourly = data.get("hourly")

    if not hourly:
        raise WeatherServiceError(
            "Weather service returned no hourly data."
        )

    times = hourly.get("time", [])
    temperatures = hourly.get(
        "temperature_2m", []
    )
    humidity = hourly.get(
        "relative_humidity_2m", []
    )
    wind_speed = hourly.get(
        "wind_speed_10m", []
    )
    wind_direction = hourly.get(
        "wind_direction_10m", []
    )
    shortwave = hourly.get(
        "shortwave_radiation", []
    )
    direct = hourly.get(
        "direct_radiation", []
    )
    diffuse = hourly.get(
        "diffuse_radiation", []
    )
    dni = hourly.get(
        "direct_normal_irradiance", []
    )
    cloud_cover = hourly.get(
        "cloud_cover", []
    )
    is_day = hourly.get(
        "is_day", []
    )

    points = []

    for index, timestamp in enumerate(times):

        points.append(
            {
                "timestamp": timestamp,
                "outdoor_temperature_c": temperatures[
                    index
                ],
                "wind_speed_m_s": wind_speed[
                    index
                ],
                "solar_irradiance_w_m2": (
                    shortwave[index]
                    if shortwave[index] is not None
                    else 0.0
                ),
                "solar_gain_w": 0.0,
                "relative_humidity_pct": (
                    humidity[index]
                ),
                "ground_temperature_c": None,
                "wind_direction_deg": (
                    wind_direction[index]
                ),
                "direct_radiation_w_m2": (
                    direct[index]
                ),
                "diffuse_radiation_w_m2": (
                    diffuse[index]
                ),
                "direct_normal_irradiance_w_m2": (
                    dni[index]
                ),
                "cloud_cover_pct": (
                    cloud_cover[index]
                ),
                "is_day": bool(is_day[index]),
            }
        )

    return {
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "elevation_m": data.get("elevation"),
        "timezone": data.get("timezone"),
        "timezone_abbreviation": data.get(
            "timezone_abbreviation"
        ),
        "source": "Open-Meteo",
        "points": points,
    }