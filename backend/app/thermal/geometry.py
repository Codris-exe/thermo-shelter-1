from dataclasses import dataclass

from app.schemas.design import ShelterDesign


@dataclass(frozen=True)
class WallGeometry:
    north_area_m2: float
    south_area_m2: float
    east_area_m2: float
    west_area_m2: float
    gross_wall_area_m2: float
    opening_area_m2: float
    opaque_wall_area_m2: float


@dataclass(frozen=True)
class ShelterGeometryResult:
    floor_area_m2: float
    roof_area_m2: float
    gross_wall_area_m2: float
    opening_area_m2: float
    opaque_wall_area_m2: float
    volume_m3: float
    surface_area_m2: float
    surface_to_volume_ratio: float
    walls: WallGeometry


def calculate_geometry(design: ShelterDesign) -> ShelterGeometryResult:
    """Calculate basic analytical geometry for a rectangular/square shelter."""

    geometry = design.geometry

    if geometry.shape not in {"rectangular", "square"}:
        raise NotImplementedError(
            f"Geometry '{geometry.shape}' is not implemented yet. "
            "Phase 1 supports rectangular and square shelters."
        )

    length = geometry.length_m
    width = geometry.width_m
    height = geometry.height_m

    if geometry.shape == "square" and abs(length - width) > 1e-9:
        raise ValueError(
            "A square shelter must have equal length and width."
        )

    floor_area = length * width
    roof_area = floor_area
    volume = floor_area * height

    north_area = length * height
    south_area = length * height
    east_area = width * height
    west_area = width * height

    gross_wall_area = (
        north_area
        + south_area
        + east_area
        + west_area
    )

    opening_area = sum(
        window.width_m * window.height_m
        for window in design.windows
    )

    opening_area += sum(
        door.width_m * door.height_m
        for door in design.doors
    )

    if opening_area >= gross_wall_area:
        raise ValueError(
            "Total window and door area must be smaller than total wall area."
        )

    opaque_wall_area = gross_wall_area - opening_area

    surface_area = (
        floor_area
        + roof_area
        + gross_wall_area
    )

    surface_to_volume_ratio = surface_area / volume

    walls = WallGeometry(
        north_area_m2=north_area,
        south_area_m2=south_area,
        east_area_m2=east_area,
        west_area_m2=west_area,
        gross_wall_area_m2=gross_wall_area,
        opening_area_m2=opening_area,
        opaque_wall_area_m2=opaque_wall_area,
    )

    return ShelterGeometryResult(
        floor_area_m2=floor_area,
        roof_area_m2=roof_area,
        gross_wall_area_m2=gross_wall_area,
        opening_area_m2=opening_area,
        opaque_wall_area_m2=opaque_wall_area,
        volume_m3=volume,
        surface_area_m2=surface_area,
        surface_to_volume_ratio=surface_to_volume_ratio,
        walls=walls,
    )