from datetime import datetime

from app.schemas.simulation import (
    HeatBalanceRequest,
    SimulationPoint,
    SimulationRequest,
    SimulationResult,
)
from app.thermal.heat_balance import calculate_heat_balance
from app.thermal.geometry import calculate_geometry


AIR_DENSITY_KG_M3 = 1.225
AIR_SPECIFIC_HEAT_J_KGK = 1005.0


def _air_thermal_capacity_j_per_k(volume_m3: float) -> float:
    """
    Calculate the thermal capacity of indoor air.

    C = m × cp
    where:
        m = air density × shelter volume
        cp = specific heat of air
    """
    air_mass_kg = AIR_DENSITY_KG_M3 * volume_m3
    return air_mass_kg * AIR_SPECIFIC_HEAT_J_KGK


def _hours_between(start: datetime, end: datetime) -> float:
    """Return the time difference between two timestamps in hours."""
    seconds = (end - start).total_seconds()
    return max(seconds / 3600.0, 0.0)


def run_transient_simulation(
    request: SimulationRequest,
) -> SimulationResult:
    """
    Run a simplified transient thermal simulation.

    Current model:
    - One thermal node representing indoor air.
    - Heat losses through walls, roof, floor, windows,
      doors and ventilation.
    - Solar gain and internal heat gain.
    - Indoor temperature is updated at each timestep.

    Thermal mass will be implemented as a separate thermal
    node in a later phase.
    """

    if len(request.weather) < 2:
        raise ValueError(
            "At least two weather points are required."
        )

    weather_points = sorted(
        request.weather,
        key=lambda point: point.timestamp,
    )

    design = request.design

    geometry = calculate_geometry(design)

    heat_capacity_j_per_k = _air_thermal_capacity_j_per_k(
        geometry.volume_m3
    )

    if heat_capacity_j_per_k <= 0:
        raise ValueError(
            "Shelter thermal capacity must be greater than zero."
        )

    indoor_temperature_c = (
        request.initial_indoor_temperature_c
    )

    points: list[SimulationPoint] = []

    total_comfort_seconds = 0.0
    total_cold_seconds = 0.0
    total_hot_seconds = 0.0

    comfort_min = design.comfort.minimum_c
    comfort_max = design.comfort.maximum_c

    for index, weather in enumerate(weather_points):

        heat_balance_request = HeatBalanceRequest(
            design=design,
            indoor_temperature_c=indoor_temperature_c,
            weather=weather,
            internal_heat_gain_w=request.internal_heat_gain_w,
        )

        heat_balance = calculate_heat_balance(
            heat_balance_request
        )

        if index < len(weather_points) - 1:
            timestep_hours = _hours_between(
                weather.timestamp,
                weather_points[index + 1].timestamp,
            )
        else:
            timestep_hours = (
                request.timestep_minutes / 60.0
            )

        timestep_seconds = timestep_hours * 3600.0

        if timestep_seconds <= 0:
            raise ValueError(
                "Weather timestamps must be strictly increasing."
            )

        energy_change_j = (
            heat_balance.net_gain_w
            * timestep_seconds
        )

        temperature_change_c = (
            energy_change_j
            / heat_capacity_j_per_k
        )

        current_indoor_temperature_c = (
            indoor_temperature_c
        )

        points.append(
            SimulationPoint(
                timestamp=weather.timestamp,
                indoor_temperature_c=round(
                    current_indoor_temperature_c,
                    3,
                ),
                outdoor_temperature_c=(
                    weather.outdoor_temperature_c
                ),
                solar_irradiance_w_m2=(
                    weather.solar_irradiance_w_m2
                ),
                solar_gain_w=heat_balance.solar_gain_w,
                wall_heat_transfer_w=heat_balance.wall_w,
                roof_heat_transfer_w=heat_balance.roof_w,
                floor_heat_transfer_w=heat_balance.floor_w,
                window_heat_transfer_w=heat_balance.windows_w,
                door_heat_transfer_w=heat_balance.doors_w,
                ventilation_heat_transfer_w=(
                    heat_balance.ventilation_w
                ),
                total_heat_loss_w=(
                    heat_balance.total_loss_w
                ),
                net_heat_gain_w=heat_balance.net_gain_w,
            )
        )

        indoor_temperature_c = (
            current_indoor_temperature_c
            + temperature_change_c
        )

        if (
            comfort_min
            <= current_indoor_temperature_c
            <= comfort_max
        ):
            total_comfort_seconds += timestep_seconds

        elif current_indoor_temperature_c < comfort_min:
            total_cold_seconds += timestep_seconds

        else:
            total_hot_seconds += timestep_seconds

    total_seconds = (
        total_comfort_seconds
        + total_cold_seconds
        + total_hot_seconds
    )

    comfort_percentage = (
        total_comfort_seconds
        / total_seconds
        * 100.0
        if total_seconds > 0
        else 0.0
    )

    indoor_temperatures = [
        point.indoor_temperature_c
        for point in points
    ]

    return SimulationResult(
        initial_indoor_temperature_c=(
            request.initial_indoor_temperature_c
        ),
        final_indoor_temperature_c=round(
            indoor_temperature_c,
            3,
        ),
        minimum_indoor_temperature_c=round(
            min(indoor_temperatures),
            3,
        ),
        maximum_indoor_temperature_c=round(
            max(indoor_temperatures),
            3,
        ),
        comfort_hours=round(
            total_comfort_seconds / 3600.0,
            3,
        ),
        cold_hours=round(
            total_cold_seconds / 3600.0,
            3,
        ),
        hot_hours=round(
            total_hot_seconds / 3600.0,
            3,
        ),
        comfort_percentage=round(
            comfort_percentage,
            2,
        ),
        points=points,
    )