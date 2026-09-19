import { getMaterial } from "./materials";

export interface MaterialLayer {
  material_id: string;
  thickness_m: number;
}

export interface MaterialAssembly {
  layers: MaterialLayer[];
}

export interface AssemblyThermalResult {
  r_total_m2k_w: number;
  u_value_w_m2k: number;
}

export function calculateAssemblyThermalProperties(
  assembly: MaterialAssembly,
  r_inside_m2k_w = 0.12,
  r_outside_m2k_w = 0.03
): AssemblyThermalResult {
  let totalLayerResistance = 0.0;

  for (const layer of assembly.layers) {
    const material = getMaterial(layer.material_id);
    const resistance = layer.thickness_m / material.thermal_conductivity_w_mk;
    totalLayerResistance += resistance;
  }

  const r_total = r_inside_m2k_w + totalLayerResistance + r_outside_m2k_w;
  const u_value = r_total > 0 ? 1.0 / r_total : 0.0;

  return {
    r_total_m2k_w: r_total,
    u_value_w_m2k: u_value,
  };
}

export function heatTransferW(
  u_value_w_m2k: number,
  area_m2: number,
  inside_temperature_c: number,
  outside_temperature_c: number
): number {
  return u_value_w_m2k * area_m2 * (inside_temperature_c - outside_temperature_c);
}
