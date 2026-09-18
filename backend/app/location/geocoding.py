from typing import Any

import httpx


OPEN_METEO_GEOCODING_URL = (
    "https://geocoding-api.open-meteo.com/v1/search"
)


class LocationSearchError(Exception):
    """Raised when location search fails."""


def search_locations(
    query: str,
    count: int = 5,
) -> list[dict[str, Any]]:
    """
    Search globally for locations using Open-Meteo geocoding.
    """

    query = query.strip()

    if len(query) < 2:
        raise LocationSearchError(
            "Location search must contain at least 2 characters."
        )

    params = {
        "name": query,
        "count": count,
        "language": "en",
        "format": "json",
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.get(
                OPEN_METEO_GEOCODING_URL,
                params=params,
            )

            response.raise_for_status()

    except httpx.HTTPError as exc:
        raise LocationSearchError(
            "Unable to contact the location service."
        ) from exc

    data = response.json()

    results = data.get("results", [])

    locations: list[dict[str, Any]] = []

    for result in results:
        locations.append(
            {
                "name": result.get("name"),
                "country": result.get("country"),
                "country_code": result.get(
                    "country_code"
                ),
                "region": result.get("admin1"),
                "latitude": result.get("latitude"),
                "longitude": result.get("longitude"),
                "elevation_m": result.get("elevation"),
                "timezone": result.get("timezone"),
            }
        )

    return locations