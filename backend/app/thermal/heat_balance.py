from dataclasses import dataclass

from app.schemas.design import ShelterDesign
from app.schemas.simulation import HeatBalanceRequest
from app.thermal.envelope import (
    calculate_assembly_thermal_properties,
    heat_transfer_w,
)
from app.thermal.geometry import calculate_geometry


AIR_DENSITY_KG_M3 = 1.225
AIR_SPECIFIC_HEAT_J_KGK = 1005.0


@dataclass(frozen=True)
class HeatTransferBreakdown:
    wall_w: float
    roof_w: float
    floor_w: float
    windows_w: float
    doors_w: float
    ventilation_w: float

    conductive_w: float
    total_loss_w: float

    solar_gain_w: float
    internal_gain_w: float

    net_gain_w: float


def _window_area_by_wall(design: ShelterDesign) -> dict[str, float]:
    areas = {
        "north": 0.0,
        "south": 0.0,
        "east": 0.0,
        "west": 0.0,
    }

    for window in design.windows:
        areas[window.wall] += window.width_m * window.height_m

    return areas


def _door_area_by_wall(design: ShelterDesign) -> dict[str, float]:
    areas = {
        "north": 0.0,
        "south": 0.0,
        "east": 0.0,
        "west": 0.0,
    }

    for door in design.doors:
        areas[door.wall] += door.width_m * door.height_m

    return areas


def calculate_heat_balance(
    request: HeatBalanceRequest,
) -> HeatTransferBreakdown:
    """
    Calculate the instantaneous thermal energy balance.

    Sign convention:
        Positive heat transfer = heat leaves the shelter.
        Negative heat transfer = heat enters the shelter.

    Therefore:
        net_gain_w > 0  -> shelter gains net heat
        net_gain_w < 0  -> shelter loses net heat
    """

    design = request.design
    indoor_c = request.indoor_temperature_c
    outdoor_c = request.weather.outdoor_temperature_c

    geometry = calculate_geometry(design)

    # ---------------------------------------------------------
    # WALLS
    # ---------------------------------------------------------

    wall_thermal = calculate_assembly_thermal_properties(
        design.wall_assembly
    )

    windows_by_wall = _window_area_by_wall(design)
    doors_by_wall = _door_area_by_wall(design)

    wall_areas = {
        "north": geometry.walls.north_area_m2,
        "south": geometry.walls.south_area_m2,
        "east": geometry.walls.east_area_m2,
        "west": geometry.walls.west_area_m2,
    }

    wall_heat_transfer = 0.0

    for wall_name, gross_area in wall_areas.items():
        opening_area = (
            windows_by_wall[wall_name]
            + doors_by_wall[wall_name]
        )

        opaque_area = max(
            gross_area - opening_area,
            0.0,
        )

        wall_heat_transfer += heat_transfer_w(
            wall_thermal.u_value_w_m2k,
            opaque_area,
            indoor_c,
            outdoor_c,
        )

    # ---------------------------------------------------------
    # ROOF
    # ---------------------------------------------------------

    roof_thermal = calculate_assembly_thermal_properties(
        design.roof_assembly
    )

    roof_heat_transfer = heat_transfer_w(
        roof_thermal.u_value_w_m2k,
        geometry.roof_area_m2,
        indoor_c,
        outdoor_c,
    )

    # ---------------------------------------------------------
    # FLOOR
    # ---------------------------------------------------------

    floor_thermal = calculate_assembly_thermal_properties(
        design.floor_assembly
    )

    ground_temperature_c = (
        request.weather.ground_temperature_c
        if request.weather.ground_temperature_c is not None
        else outdoor_c
    )

    floor_heat_transfer = heat_transfer_w(
        floor_thermal.u_value_w_m2k,
        geometry.floor_area_m2,
        indoor_c,
        ground_temperature_c,
    )

    # ---------------------------------------------------------
    # WINDOWS
    # ---------------------------------------------------------

    window_heat_transfer = 0.0

    for window in design.windows:
        area = window.width_m * window.height_m

        window_heat_transfer += (
            window.u_value_w_m2k
            * area
            * (indoor_c - outdoor_c)
        )

    # ---------------------------------------------------------
    # DOORS
    # ---------------------------------------------------------

    door_heat_transfer = 0.0

    for door in design.doors:
        area = door.width_m * door.height_m

        door_heat_transfer += (
            door.u_value_w_m2k
            * area
            * (indoor_c - outdoor_c)
        )

    # ---------------------------------------------------------
    # VENTILATION / INFILTRATION
    # ---------------------------------------------------------

    ach = design.ventilation.ach

    air_mass_flow_kg_s = (
        AIR_DENSITY_KG_M3
        * geometry.volume_m3
        * ach
        / 3600.0
    )

    ventilation_heat_transfer = (
        air_mass_flow_kg_s
        * AIR_SPECIFIC_HEAT_J_KGK
        * (indoor_c - outdoor_c)
    )

    # ---------------------------------------------------------
    # TOTAL CONDUCTIVE / ENVELOPE TRANSFER
    # ---------------------------------------------------------

    conductive_heat_transfer = (
        wall_heat_transfer
        + roof_heat_transfer
        + floor_heat_transfer
        + window_heat_transfer
        + door_heat_transfer
    )

    total_heat_loss = (
        conductive_heat_transfer
        + ventilation_heat_transfer
    )

    # ---------------------------------------------------------
    # SOLAR + INTERNAL GAINS
    # ---------------------------------------------------------

    solar_gain = request.solar_gain_w
    internal_gain = request.internal_heat_gain_w

    # Positive value means the shelter gains net heat.
    net_gain = (
        solar_gain
        + internal_gain
        - total_heat_loss
    )

    return HeatTransferBreakdown(
        wall_w=wall_heat_transfer,
        roof_w=roof_heat_transfer,
        floor_w=floor_heat_transfer,
        windows_w=window_heat_transfer,
        doors_w=door_heat_transfer,
        ventilation_w=ventilation_heat_transfer,
        conductive_w=conductive_heat_transfer,
        total_loss_w=total_heat_loss,
        solar_gain_w=solar_gain,
        internal_gain_w=internal_gain,
        net_gain_w=net_gain,
    )