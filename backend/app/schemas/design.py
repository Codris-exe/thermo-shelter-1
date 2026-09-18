from typing import Literal

from pydantic import BaseModel, Field


class LocationConfig(BaseModel):
    name: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    elevation_m: float | None = None
    timezone: str | None = None
    source: Literal["gps", "search", "manual"] = "manual"


class GeometryConfig(BaseModel):
    shape: Literal[
        "rectangular",
        "square",
        "cylindrical",
        "dome",
    ] = "rectangular"

    length_m: float = Field(gt=0)
    width_m: float = Field(gt=0)
    height_m: float = Field(gt=0)


class MaterialLayer(BaseModel):
    material_id: str
    thickness_m: float = Field(gt=0)


class MaterialAssembly(BaseModel):
    layers: list[MaterialLayer] = Field(min_length=1)


class WindowConfig(BaseModel):
    wall: Literal["north", "south", "east", "west"]
    width_m: float = Field(gt=0)
    height_m: float = Field(gt=0)
    u_value_w_m2k: float = Field(gt=0)
    solar_transmittance: float = Field(ge=0, le=1)


class DoorConfig(BaseModel):
    wall: Literal["north", "south", "east", "west"]
    width_m: float = Field(gt=0)
    height_m: float = Field(gt=0)
    u_value_w_m2k: float = Field(gt=0)


class ThermalMassConfig(BaseModel):
    material_id: str
    mass_kg: float = Field(gt=0)
    specific_heat_j_kgk: float = Field(gt=0)

    initial_temperature_c: float

    # Effective coupling between indoor air and thermal mass.
    # This is a simplified lumped-model parameter.
    coupling_w_per_k: float = Field(
        default=5.0,
        gt=0,
    )


class VentilationConfig(BaseModel):
    ach: float = Field(default=0.5, ge=0)


class ComfortConfig(BaseModel):
    minimum_c: float = 18.0
    maximum_c: float = 26.0


class ShelterDesign(BaseModel):
    location: LocationConfig

    geometry: GeometryConfig

    orientation_deg: float = Field(
        default=180.0,
        ge=0,
        le=360,
    )

    wall_assembly: MaterialAssembly

    roof_assembly: MaterialAssembly

    floor_assembly: MaterialAssembly

    windows: list[WindowConfig] = Field(
        default_factory=list
    )

    doors: list[DoorConfig] = Field(
        default_factory=list
    )

    thermal_mass: ThermalMassConfig | None = None

    ventilation: VentilationConfig = Field(
        default_factory=VentilationConfig
    )

    comfort: ComfortConfig = Field(
        default_factory=ComfortConfig
    )