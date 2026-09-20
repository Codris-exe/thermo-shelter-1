from dataclasses import dataclass


@dataclass(frozen=True)
class Material:
    name: str
    thermal_conductivity_w_mk: float
    density_kg_m3: float
    specific_heat_j_kgk: float
    solar_absorptivity: float = 0.6
    emissivity: float = 0.9
    category: str = "general"
    description: str = ""


# Engineering/reference values for the prototype.
# Values are approximate and should be validated against
# project-approved material data before real engineering use.
MATERIALS: dict[str, Material] = {

    # ------------------------------------------------------------------
    # STRUCTURAL / WALL MATERIALS
    # ------------------------------------------------------------------

    "brick": Material(
        name="Brick",
        thermal_conductivity_w_mk=0.72,
        density_kg_m3=1800,
        specific_heat_j_kgk=840,
        solar_absorptivity=0.65,
        category="wall",
        description="Traditional masonry with moderate thermal mass.",
    ),

    "concrete": Material(
        name="Concrete",
        thermal_conductivity_w_mk=1.40,
        density_kg_m3=2300,
        specific_heat_j_kgk=880,
        solar_absorptivity=0.60,
        category="structural",
        description="Dense structural material with high thermal mass.",
    ),

    "stone": Material(
        name="Stone",
        thermal_conductivity_w_mk=1.70,
        density_kg_m3=2600,
        specific_heat_j_kgk=800,
        solar_absorptivity=0.70,
        category="wall",
        description="Dense natural material with high thermal mass.",
    ),

    "adobe": Material(
        name="Adobe",
        thermal_conductivity_w_mk=0.43,
        density_kg_m3=1600,
        specific_heat_j_kgk=840,
        solar_absorptivity=0.65,
        category="wall",
        description="Earth-based material with useful thermal mass.",
    ),

    "wood": Material(
        name="Wood",
        thermal_conductivity_w_mk=0.13,
        density_kg_m3=500,
        specific_heat_j_kgk=1600,
        solar_absorptivity=0.55,
        category="wall",
        description="Lightweight material with relatively low conductivity.",
    ),

    # ------------------------------------------------------------------
    # INSULATION MATERIALS
    # ------------------------------------------------------------------

    "rock_wool": Material(
        name="Rock Wool",
        thermal_conductivity_w_mk=0.040,
        density_kg_m3=80,
        specific_heat_j_kgk=840,
        solar_absorptivity=0.30,
        category="insulation",
        description="Mineral insulation with low thermal conductivity.",
    ),

    "glass_wool": Material(
        name="Glass Wool",
        thermal_conductivity_w_mk=0.040,
        density_kg_m3=20,
        specific_heat_j_kgk=840,
        solar_absorptivity=0.30,
        category="insulation",
        description="Lightweight fibrous insulation.",
    ),

    "eps": Material(
        name="EPS",
        thermal_conductivity_w_mk=0.035,
        density_kg_m3=25,
        specific_heat_j_kgk=1450,
        solar_absorptivity=0.30,
        category="insulation",
        description="Expanded polystyrene insulation.",
    ),

    "xps": Material(
        name="XPS",
        thermal_conductivity_w_mk=0.030,
        density_kg_m3=35,
        specific_heat_j_kgk=1450,
        solar_absorptivity=0.30,
        category="insulation",
        description="Extruded polystyrene with low thermal conductivity.",
    ),

    "polyurethane": Material(
        name="Polyurethane Foam",
        thermal_conductivity_w_mk=0.025,
        density_kg_m3=35,
        specific_heat_j_kgk=1400,
        solar_absorptivity=0.30,
        category="insulation",
        description="High-performance low-conductivity insulation.",
    ),

    "cellulose": Material(
        name="Cellulose",
        thermal_conductivity_w_mk=0.040,
        density_kg_m3=50,
        specific_heat_j_kgk=1600,
        solar_absorptivity=0.40,
        category="insulation",
        description="Fiber-based insulation material.",
    ),

    # ------------------------------------------------------------------
    # INTERIOR / FINISH MATERIALS
    # ------------------------------------------------------------------

    "gypsum": Material(
        name="Gypsum Board",
        thermal_conductivity_w_mk=0.17,
        density_kg_m3=800,
        specific_heat_j_kgk=1090,
        solar_absorptivity=0.40,
        category="interior",
        description="Light interior lining material.",
    ),

    "plaster": Material(
        name="Plaster",
        thermal_conductivity_w_mk=0.35,
        density_kg_m3=1000,
        specific_heat_j_kgk=840,
        solar_absorptivity=0.50,
        category="interior",
        description="Common interior and exterior finishing layer.",
    ),

    # ------------------------------------------------------------------
    # LIGHTWEIGHT / ALTERNATIVE MATERIALS
    # ------------------------------------------------------------------

    "straw_bale": Material(
        name="Straw Bale",
        thermal_conductivity_w_mk=0.067,
        density_kg_m3=110,
        specific_heat_j_kgk=1300,
        solar_absorptivity=0.50,
        category="alternative",
        description="Highly insulating bio-based building material.",
    ),

    "rammed_earth": Material(
        name="Rammed Earth",
        thermal_conductivity_w_mk=0.70,
        density_kg_m3=2000,
        specific_heat_j_kgk=900,
        solar_absorptivity=0.70,
        category="alternative",
        description="Dense earth construction with significant thermal mass.",
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