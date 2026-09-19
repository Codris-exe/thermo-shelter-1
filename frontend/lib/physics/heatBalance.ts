import {
  calculateGeometry,
  GeometryConfig,
  WindowConfig,
  DoorConfig,
} from "./geometry";
import {
  calculateAssemblyThermalProperties,
  heatTransferW,
  MaterialAssembly,
} from "./envelope";

export interface VentilationConfig {
  ach: number;
}

export interface ComfortConfig {
  minimum_c: number;
  maximum_c: number;
}

export interface HeatBalanceInput {
  geometry: GeometryConfig;
  wall_assembly: MaterialAssembly;
  roof_assembly: MaterialAssembly;
  floor_assembly: MaterialAssembly;
  windows: WindowConfig[];
  doors: DoorConfig[];
  ventilation: VentilationConfig;
  indoor_temperature_c: number;
  outdoor_temperature_c: number;
  ground_temperature_c?: number | null;
  solar_gain_w: number;
  internal_heat_gain_w: number;
}

export interface HeatBalanceBreakdown {
  wall_w: number;
  roof_w: number;
  floor_w: number;
  windows_w: number;
  doors_w: number;
  ventilation_w: number;
  conductive_w: number;
  total_loss_w: number;
  solar_gain_w: number;
  internal_gain_w: number;
  net_gain_w: number;
}

const AIR_DENSITY_KG_M3 = 1.225;
const AIR_SPECIFIC_HEAT_J_KGK = 1005.0;

export function calculateHeatBalance(input: HeatBalanceInput): HeatBalanceBreakdown {
  const {
    geometry: geomConfig,
    wall_assembly,
    roof_assembly,
    floor_assembly,
    windows,
    doors,
    ventilation,
    indoor_temperature_c,
    outdoor_temperature_c,
    ground_temperature_c,
    solar_gain_w,
    internal_heat_gain_w,
  } = input;

  const geometry = calculateGeometry(geomConfig, windows, doors);
  const wallThermal = calculateAssemblyThermalProperties(wall_assembly);
  const roofThermal = calculateAssemblyThermalProperties(roof_assembly);
  const floorThermal = calculateAssemblyThermalProperties(floor_assembly);

  const wall_w = heatTransferW(
    wallThermal.u_value_w_m2k,
    geometry.opaque_wall_area_m2,
    indoor_temperature_c,
    outdoor_temperature_c
  );

  const roof_w = heatTransferW(
    roofThermal.u_value_w_m2k,
    geometry.roof_area_m2,
    indoor_temperature_c,
    outdoor_temperature_c
  );

  const groundT = ground_temperature_c ?? outdoor_temperature_c;
  const floor_w = heatTransferW(
    floorThermal.u_value_w_m2k,
    geometry.floor_area_m2,
    indoor_temperature_c,
    groundT
  );

  let windows_w = 0;
  for (const win of windows) {
    const area = win.width_m * win.height_m;
    windows_w += win.u_value_w_m2k * area * (indoor_temperature_c - outdoor_temperature_c);
  }

  let doors_w = 0;
  for (const door of doors) {
    const area = door.width_m * door.height_m;
    doors_w += door.u_value_w_m2k * area * (indoor_temperature_c - outdoor_temperature_c);
  }

  const airMassFlowKgS =
    (AIR_DENSITY_KG_M3 * geometry.volume_m3 * (ventilation.ach || 0.5)) / 3600.0;
  const ventilation_w =
    airMassFlowKgS * AIR_SPECIFIC_HEAT_J_KGK * (indoor_temperature_c - outdoor_temperature_c);

  const conductive_w = wall_w + roof_w + floor_w + windows_w + doors_w;
  const total_loss_w = conductive_w + ventilation_w;
  const net_gain_w = solar_gain_w + internal_heat_gain_w - total_loss_w;

  return {
    wall_w,
    roof_w,
    floor_w,
    windows_w,
    doors_w,
    ventilation_w,
    conductive_w,
    total_loss_w,
    solar_gain_w,
    internal_gain_w: internal_heat_gain_w,
    net_gain_w,
  };
}
