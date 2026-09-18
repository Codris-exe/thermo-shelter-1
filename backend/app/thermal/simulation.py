from datetime import datetime

from app.schemas.simulation import (
    HeatBalanceRequest,
    SimulationPoint,
    SimulationRequest,
    SimulationResult,
)
from app.solar.model import calculate_solar
from app.schemas.solar import SolarCalculationRequest
from app.thermal.envelope import (
    calculate_assembly_thermal_properties,
)
from app.thermal.geometry import calculate_geometry
from app.thermal.heat_balance import calculate_heat_balance
from app.thermal.materials import get_material


AIR_DENSITY_KG_M3 = 1.225
AIR_SPECIFIC_HEAT_J_KGK = 1005.0

# Only a fraction of the total wall/roof/floor material
# participates in the short-term hourly indoor thermal response.
#
# This is a simplified lumped-model assumption.
#
# 0.20 means 20% of the calculated envelope thermal
# capacity is treated as thermally active over the
# simulation timescale.
ACTIVE_ENVELOPE_THERMAL_FRACTION = 0.20


def _air_thermal_capacity_j_per_k(
    volume_m3: float,
) -> float:
    """
    Calculate thermal capacity of indoor air.

    C = mass × specific heat
    """

    air_mass_kg = (
        AIR_DENSITY_KG_M3
        * volume_m3
    )

    return (
        air_mass_kg
        * AIR_SPECIFIC_HEAT_J_KGK
    )


def _assembly_thermal_capacity_j_per_k(
    assembly,
    area_m2: float,
) -> float:
    """
    Calculate the thermal capacity of all material
    layers in an assembly.

    C = mass × specific heat

    mass = area × thickness × density
    """

    total_capacity = 0.0

    for layer in assembly.layers:

        material = get_material(
            layer.material_id
        )

        mass_kg = (
            area_m2
            * layer.thickness_m
            * material.density_kg_m3
        )

        capacity = (
            mass_kg
            * material.specific_heat_j_kgk
        )

        total_capacity += capacity

    return total_capacity


def _active_envelope_thermal_capacity_j_per_k(
    design,
) -> float:
    """
    Calculate an effective thermal capacity for the
    shelter envelope.

    This includes:

    - opaque walls
    - roof
    - floor

    Only a fraction of the total construction mass is
    treated as thermally active for the hourly model.

    This is a simplified lumped thermal model, not CFD.
    """

    geometry = calculate_geometry(
        design
    )

    wall_capacity = (
        _assembly_thermal_capacity_j_per_k(
            design.wall_assembly,
            geometry.walls.opaque_wall_area_m2,
        )
    )

    roof_capacity = (
        _assembly_thermal_capacity_j_per_k(
            design.roof_assembly,
            geometry.roof_area_m2,
        )
    )

    floor_capacity = (
        _assembly_thermal_capacity_j_per_k(
            design.floor_assembly,
            geometry.floor_area_m2,
        )
    )

    total_construction_capacity = (
        wall_capacity
        + roof_capacity
        + floor_capacity
    )

    return (
        total_construction_capacity
        * ACTIVE_ENVELOPE_THERMAL_FRACTION
    )


def _hours_between(
    start: datetime,
    end: datetime,
) -> float:
    """Return time difference in hours."""

    seconds = (
        end - start
    ).total_seconds()

    return max(
        seconds / 3600.0,
        0.0,
    )


def _calculate_real_solar_gain(
    design,
    weather,
) -> float:
    """
    Calculate window-transmitted solar gain using
    the solar-position model and real solar data.
    """

    timezone = (
        design.location.timezone
        or "UTC"
    )

    request = SolarCalculationRequest(
        design=design,
        timestamp=weather.timestamp,
        latitude=(
            design.location.latitude
        ),
        longitude=(
            design.location.longitude
        ),
        solar_irradiance_w_m2=(
            weather.solar_irradiance_w_m2
        ),
        direct_radiation_w_m2=(
            weather.direct_radiation_w_m2
        ),
        diffuse_radiation_w_m2=(
            weather.diffuse_radiation_w_m2
        ),
        direct_normal_irradiance_w_m2=(
            weather.direct_normal_irradiance_w_m2
        ),
        timezone=timezone,
    )

    result = calculate_solar(
        request
    )

    return max(
        result.total_window_solar_gain_w,
        0.0,
    )


def run_transient_simulation(
    request: SimulationRequest,
) -> SimulationResult:
    """
    Run the Thermo Shelter transient thermal model.

    Thermal representation:

        REAL WEATHER
              ↓
         Solar Engine
              ↓
        ┌───────────────┐
        │  Heat Balance │
        └───────┬───────┘
                ↓
          Indoor Air
                ↕
         Active Envelope
                ↕
         Optional Thermal Mass

    This is a simplified lumped thermal model.

    It is NOT a CFD/FEA simulation.
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

    geometry = calculate_geometry(
        design
    )

    # ---------------------------------------------------------
    # THERMAL CAPACITY
    # ---------------------------------------------------------

    air_capacity = (
        _air_thermal_capacity_j_per_k(
            geometry.volume_m3
        )
    )

    envelope_capacity = (
        _active_envelope_thermal_capacity_j_per_k(
            design
        )
    )

    effective_indoor_capacity = (
        air_capacity
        + envelope_capacity
    )

    if effective_indoor_capacity <= 0:
        raise ValueError(
            "Effective thermal capacity must be greater than zero."
        )

    # ---------------------------------------------------------
    # INITIAL INDOOR TEMPERATURE
    # ---------------------------------------------------------

    indoor_temperature_c = (
        request.initial_indoor_temperature_c
    )

    # ---------------------------------------------------------
    # OPTIONAL EXPLICIT THERMAL MASS
    # ---------------------------------------------------------

    if design.thermal_mass is not None:

        thermal_mass_temperature_c = (
            design.thermal_mass
            .initial_temperature_c
        )

        thermal_mass_capacity_j_per_k = (
            design.thermal_mass.mass_kg
            * design.thermal_mass
            .specific_heat_j_kgk
        )

        thermal_mass_coupling_w_per_k = (
            design.thermal_mass
            .coupling_w_per_k
        )

    else:

        thermal_mass_temperature_c = None

        thermal_mass_capacity_j_per_k = 0.0

        thermal_mass_coupling_w_per_k = 0.0

    # ---------------------------------------------------------
    # RESULTS
    # ---------------------------------------------------------

    points: list[SimulationPoint] = []

    total_comfort_seconds = 0.0
    total_cold_seconds = 0.0
    total_hot_seconds = 0.0

    comfort_min = (
        design.comfort.minimum_c
    )

    comfort_max = (
        design.comfort.maximum_c
    )

    # ---------------------------------------------------------
    # TIME LOOP
    # ---------------------------------------------------------

    for index, weather in enumerate(
        weather_points
    ):

        # -----------------------------------------------------
        # SOLAR GAIN
        # -----------------------------------------------------

        solar_gain_w = (
            _calculate_real_solar_gain(
                design,
                weather,
            )
        )

        weather_with_solar = (
            weather.model_copy(
                update={
                    "solar_gain_w": solar_gain_w
                }
            )
        )

        # -----------------------------------------------------
        # HEAT BALANCE
        # -----------------------------------------------------

        heat_balance = calculate_heat_balance(
            HeatBalanceRequest(
                design=design,
                indoor_temperature_c=(
                    indoor_temperature_c
                ),
                weather=weather_with_solar,
                internal_heat_gain_w=(
                    request.internal_heat_gain_w
                ),
            )
        )

        # -----------------------------------------------------
        # TIMESTEP
        # -----------------------------------------------------

        if index < len(weather_points) - 1:

            timestep_hours = (
                _hours_between(
                    weather.timestamp,
                    weather_points[
                        index + 1
                    ].timestamp,
                )
            )

        else:

            timestep_hours = (
                request.timestep_minutes
                / 60.0
            )

        timestep_seconds = (
            timestep_hours * 3600.0
        )

        if timestep_seconds <= 0:
            raise ValueError(
                "Weather timestamps must be strictly increasing."
            )

        # -----------------------------------------------------
        # THERMAL MASS ↔ INDOOR AIR
        # -----------------------------------------------------

        if (
            thermal_mass_temperature_c
            is not None
        ):

            thermal_mass_heat_transfer_w = (
                thermal_mass_coupling_w_per_k
                * (
                    thermal_mass_temperature_c
                    - indoor_temperature_c
                )
            )

        else:

            thermal_mass_heat_transfer_w = 0.0

        # -----------------------------------------------------
        # NET INDOOR HEAT GAIN
        # -----------------------------------------------------

        indoor_net_gain_w = (
            heat_balance.net_gain_w
            + thermal_mass_heat_transfer_w
        )

        indoor_energy_change_j = (
            indoor_net_gain_w
            * timestep_seconds
        )

        indoor_temperature_change_c = (
            indoor_energy_change_j
            / effective_indoor_capacity
        )

        # -----------------------------------------------------
        # THERMAL MASS TEMPERATURE CHANGE
        # -----------------------------------------------------

        if (
            thermal_mass_temperature_c
            is not None
        ):

            thermal_mass_energy_change_j = (
                -thermal_mass_heat_transfer_w
                * timestep_seconds
            )

            thermal_mass_temperature_change_c = (
                thermal_mass_energy_change_j
                / thermal_mass_capacity_j_per_k
            )

        else:

            thermal_mass_temperature_change_c = 0.0

        # -----------------------------------------------------
        # STORE CURRENT STATE
        # -----------------------------------------------------

        current_indoor_temperature_c = (
            indoor_temperature_c
        )

        if (
            thermal_mass_temperature_c
            is not None
        ):

            current_thermal_mass_temperature_c = (
                thermal_mass_temperature_c
            )

        else:

            current_thermal_mass_temperature_c = (
                indoor_temperature_c
            )

        points.append(
            SimulationPoint(
                timestamp=weather.timestamp,

                indoor_temperature_c=round(
                    current_indoor_temperature_c,
                    3,
                ),

                thermal_mass_temperature_c=round(
                    current_thermal_mass_temperature_c,
                    3,
                ),

                outdoor_temperature_c=round(
                    weather.outdoor_temperature_c,
                    3,
                ),

                solar_irradiance_w_m2=round(
                    weather.solar_irradiance_w_m2,
                    3,
                ),

                solar_gain_w=round(
                    solar_gain_w,
                    3,
                ),

                wall_heat_transfer_w=round(
                    heat_balance.wall_w,
                    3,
                ),

                roof_heat_transfer_w=round(
                    heat_balance.roof_w,
                    3,
                ),

                floor_heat_transfer_w=round(
                    heat_balance.floor_w,
                    3,
                ),

                window_heat_transfer_w=round(
                    heat_balance.windows_w,
                    3,
                ),

                door_heat_transfer_w=round(
                    heat_balance.doors_w,
                    3,
                ),

                ventilation_heat_transfer_w=round(
                    heat_balance.ventilation_w,
                    3,
                ),

                thermal_mass_heat_transfer_w=round(
                    thermal_mass_heat_transfer_w,
                    3,
                ),

                total_heat_loss_w=round(
                    heat_balance.total_loss_w,
                    3,
                ),

                net_heat_gain_w=round(
                    indoor_net_gain_w,
                    3,
                ),
            )
        )

        # -----------------------------------------------------
        # ADVANCE INDOOR TEMPERATURE
        # -----------------------------------------------------

        indoor_temperature_c = (
            current_indoor_temperature_c
            + indoor_temperature_change_c
        )

        # -----------------------------------------------------
        # ADVANCE THERMAL MASS
        # -----------------------------------------------------

        if (
            thermal_mass_temperature_c
            is not None
        ):

            thermal_mass_temperature_c = (
                current_thermal_mass_temperature_c
                + thermal_mass_temperature_change_c
            )

        # -----------------------------------------------------
        # COMFORT
        # -----------------------------------------------------

        if (
            comfort_min
            <= current_indoor_temperature_c
            <= comfort_max
        ):

            total_comfort_seconds += (
                timestep_seconds
            )

        elif (
            current_indoor_temperature_c
            < comfort_min
        ):

            total_cold_seconds += (
                timestep_seconds
            )

        else:

            total_hot_seconds += (
                timestep_seconds
            )

    # ---------------------------------------------------------
    # SUMMARY
    # ---------------------------------------------------------

    total_seconds = (
        total_comfort_seconds
        + total_cold_seconds
        + total_hot_seconds
    )

    comfort_percentage = (
        (
            total_comfort_seconds
            / total_seconds
        )
        * 100.0
        if total_seconds > 0
        else 0.0
    )

    indoor_temperatures = [
        point.indoor_temperature_c
        for point in points
    ]

    thermal_mass_temperatures = [
        point.thermal_mass_temperature_c
        for point in points
    ]

    return SimulationResult(

        initial_indoor_temperature_c=(
            request
            .initial_indoor_temperature_c
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

        initial_thermal_mass_temperature_c=(
            design.thermal_mass
            .initial_temperature_c
            if design.thermal_mass
            is not None
            else None
        ),

        final_thermal_mass_temperature_c=(
            round(
                thermal_mass_temperature_c,
                3,
            )
            if thermal_mass_temperature_c
            is not None
            else None
        ),

        minimum_thermal_mass_temperature_c=(
            round(
                min(
                    thermal_mass_temperatures
                ),
                3,
            )
            if design.thermal_mass
            is not None
            else None
        ),

        maximum_thermal_mass_temperature_c=(
            round(
                max(
                    thermal_mass_temperatures
                ),
                3,
            )
            if design.thermal_mass
            is not None
            else None
        ),

        comfort_hours=round(
            total_comfort_seconds
            / 3600.0,
            3,
        ),

        cold_hours=round(
            total_cold_seconds
            / 3600.0,
            3,
        ),

        hot_hours=round(
            total_hot_seconds
            / 3600.0,
            3,
        ),

        comfort_percentage=round(
            comfort_percentage,
            2,
        ),

        points=points,
    )