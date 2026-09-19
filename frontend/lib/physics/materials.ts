export interface Material {
  name: string;
  thermal_conductivity_w_mk: number;
  density_kg_m3: number;
  specific_heat_j_kgk: number;
  solar_absorptivity: number;
  emissivity: number;
}

export const MATERIALS: Record<string, Material> = {
  brick: {
    name: "Brick",
    thermal_conductivity_w_mk: 0.72,
    density_kg_m3: 1800,
    specific_heat_j_kgk: 840,
    solar_absorptivity: 0.6,
    emissivity: 0.9,
  },
  concrete: {
    name: "Concrete",
    thermal_conductivity_w_mk: 1.40,
    density_kg_m3: 2300,
    specific_heat_j_kgk: 880,
    solar_absorptivity: 0.6,
    emissivity: 0.9,
  },
  stone: {
    name: "Stone",
    thermal_conductivity_w_mk: 1.70,
    density_kg_m3: 2600,
    specific_heat_j_kgk: 800,
    solar_absorptivity: 0.6,
    emissivity: 0.9,
  },
  wood: {
    name: "Wood",
    thermal_conductivity_w_mk: 0.13,
    density_kg_m3: 500,
    specific_heat_j_kgk: 1600,
    solar_absorptivity: 0.6,
    emissivity: 0.9,
  },
  eps: {
    name: "EPS",
    thermal_conductivity_w_mk: 0.035,
    density_kg_m3: 25,
    specific_heat_j_kgk: 1450,
    solar_absorptivity: 0.6,
    emissivity: 0.9,
  },
  xps: {
    name: "XPS",
    thermal_conductivity_w_mk: 0.030,
    density_kg_m3: 35,
    specific_heat_j_kgk: 1450,
    solar_absorptivity: 0.6,
    emissivity: 0.9,
  },
  rock_wool: {
    name: "Rock Wool",
    thermal_conductivity_w_mk: 0.040,
    density_kg_m3: 80,
    specific_heat_j_kgk: 840,
    solar_absorptivity: 0.6,
    emissivity: 0.9,
  },
  gypsum: {
    name: "Gypsum Board",
    thermal_conductivity_w_mk: 0.17,
    density_kg_m3: 800,
    specific_heat_j_kgk: 1090,
    solar_absorptivity: 0.6,
    emissivity: 0.9,
  },
  adobe: {
    name: "Adobe",
    thermal_conductivity_w_mk: 0.43,
    density_kg_m3: 1600,
    specific_heat_j_kgk: 840,
    solar_absorptivity: 0.6,
    emissivity: 0.9,
  },
};

export function getMaterial(id: string): Material {
  const mat = MATERIALS[id];
  if (!mat) {
    throw new Error(`Unknown material '${id}'. Available: ${Object.keys(MATERIALS).join(", ")}`);
  }
  return mat;
}
