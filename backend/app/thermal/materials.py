from dataclasses import dataclass


@dataclass(frozen=True)
class Material:
    name: str
    thermal_conductivity_w_mk: float
    density_kg_m3: float
    specific_heat_j_kgk: float
    solar_absorptivity: float = 0.6
    emissivity: float = 0.9


# Initial engineering/reference values for the prototype.
# These are approximate and must be replaced/validated against
# project-approved material data before real engineering use.
MATERIALS: dict[str, Material] = {
    "brick": Material(
        name="Brick",
        thermal_conductivity_w_mk=0.72,
        density_kg_m3=1800,
        specific_heat_j_kgk=840,
    ),
    "concrete": Material(
        name="Concrete",
        thermal_conductivity_w_mk=1.40,
        density_kg_m3=2300,
        specific_heat_j_kgk=880,
    ),
    "stone": Material(
        name="Stone",
        thermal_conductivity_w_mk=1.70,
        density_kg_m3=2600,
        specific_heat_j_kgk=800,
    ),
    "wood": Material(
        name="Wood",
        thermal_conductivity_w_mk=0.13,
        density_kg_m3=500,
        specific_heat_j_kgk=1600,
    ),
    "eps": Material(
        name="EPS",
        thermal_conductivity_w_mk=0.035,
        density_kg_m3=25,
        specific_heat_j_kgk=1450,
    ),
    "xps": Material(
        name="XPS",
        thermal_conductivity_w_mk=0.030,
        density_kg_m3=35,
        specific_heat_j_kgk=1450,
    ),
    "rock_wool": Material(
        name="Rock Wool",
        thermal_conductivity_w_mk=0.040,
        density_kg_m3=80,
        specific_heat_j_kgk=840,
    ),
    "gypsum": Material(
        name="Gypsum Board",
        thermal_conductivity_w_mk=0.17,
        density_kg_m3=800,
        specific_heat_j_kgk=1090,
    ),
    "adobe": Material(
        name="Adobe",
        thermal_conductivity_w_mk=0.43,
        density_kg_m3=1600,
        specific_heat_j_kgk=840,
    ),
}


def get_material(material_id: str) -> Material:
    """Return a material by ID or raise a clear error."""
    try:
        return MATERIALS[material_id]
    except KeyError as exc:
        available = ", ".join(sorted(MATERIALS))
        raise ValueError(
            f"Unknown material '{material_id}'. "
            f"Available materials: {available}"
        ) from exc