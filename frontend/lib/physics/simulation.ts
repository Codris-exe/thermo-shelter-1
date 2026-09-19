import {
  calculateGeometry,
  GeometryConfig,
  WindowConfig,
  DoorConfig,
} from "./geometry";
import { MaterialAssembly } from "./envelope";
import { getMaterial } from "./materials";
import { calculateSolarPosition, calculateWindowSolarGain } from "./solar";
import {
  calculateHeatBalance,
  VentilationConfig,
  ComfortConfig,
} from "./heatBalance";

export interface ThermalMassConfig {
  material_id: string;
  mass_kg: number;
  specific_heat_j_kgk: number;
  initial_temperature_c: number;
  coupling_w_per_k: number;
}

export interface SimulationLocationConfig {
  name: string;
  latitude: number;
  longitude: number;
  elevation_m?: number | null;
  timezone?: string | null;
}

export interface SimulationShelterDesign {
  location: SimulationLocationConfig;
  geometry: GeometryConfig;
  orientation_deg: number;
  wall_assembly: MaterialAssembly;
  roof_assembly: MaterialAssembly;
  floor_assembly: MaterialAssembly;
  windows: WindowConfig[];
  doors: DoorConfig[];
  thermal_mass?: ThermalMassConfig | null;
  ventilation: VentilationConfig;
  comfort: ComfortConfig;
}

export interface SimulationWeatherInputPoint {
  timestamp: string;
  outdoor_temperature_c: number;
  solar_irradiance_w_m2?: number;
  direct_radiation_w_m2?: number;
  diffuse_radiation_w_m2?: number;
  direct_normal_irradiance_w_m2?: number;
  ground_temperature_c?: number | null;
  wind_speed_m_s?: number;
  relative_humidity_pct?: number | null;
}

export interface TransientSimulationPoint {
  timestamp: string;
  indoor_temperature_c: number;
  thermal_mass_temperature_c: number;
  outdoor_temperature_c: number;
  solar_irradiance_w_m2: number;
  solar_gain_w: number;
  wall_heat_transfer_w: number;
  roof_heat_transfer_w: number;
  floor_heat_transfer_w: number;
  window_heat_transfer_w: number;
  door_heat_transfer_w: number;
  ventilation_heat_transfer_w: number;
  thermal_mass_heat_transfer_w: number;
  total_heat_loss_w: number;
  net_heat_gain_w: number;
}

export interface TransientSimulationResult {
  initial_indoor_temperature_c: number;
  final_indoor_temperature_c: number;
  minimum_indoor_temperature_c: number;
  maximum_indoor_temperature_c: number;
  initial_thermal_mass_temperature_c: number | null;
  final_thermal_mass_temperature_c: number | null;
  minimum_thermal_mass_temperature_c: number | null;
  maximum_thermal_mass_temperature_c: number | null;
  comfort_hours: number;
  cold_hours: number;
  hot_hours: number;
  comfort_percentage: number;
  points: TransientSimulationPoint[];
}

const AIR_DENSITY_KG_M3 = 1.225;
const AIR_SPECIFIC_HEAT_J_KGK = 1005.0;
const ACTIVE_ENVELOPE_THERMAL_FRACTION = 0.20;

function calculateAssemblyThermalCapacity(
  assembly: MaterialAssembly,
  area_m2: number
): number {
  let capacity = 0;
  for (const layer of assembly.layers) {
    const mat = getMaterial(layer.material_id);
    const massKg = area_m2 * layer.thickness_m * mat.density_kg_m3;
    capacity += massKg * mat.specific_heat_j_kgk;
  }
  return capacity;
}

export function runTransientSimulation(params: {
  design: SimulationShelterDesign;
  initial_indoor_temperature_c: number;
  weather: SimulationWeatherInputPoint[];
  internal_heat_gain_w?: number;
  timestep_minutes?: number;
}): TransientSimulationResult {
  const {
    design,
    initial_indoor_temperature_c,
    weather,
    internal_heat_gain_w = 0,
    timestep_minutes = 60,
  } = params;

  if (weather.length < 2) {
    throw new Error("At least two weather points are required.");
  }

  const geometry = calculateGeometry(
    design.geometry,
    design.windows,
    design.doors
  );

  const airCapacity = AIR_DENSITY_KG_M3 * geometry.volume_m3 * AIR_SPECIFIC_HEAT_J_KGK;
  const wallCapacity = calculateAssemblyThermalCapacity(
    design.wall_assembly,
    geometry.walls.opaque_wall_area_m2
  );
  const roofCapacity = calculateAssemblyThermalCapacity(
    design.roof_assembly,
    geometry.roof_area_m2
  );
  const floorCapacity = calculateAssemblyThermalCapacity(
    design.floor_assembly,
    geometry.floor_area_m2
  );

  const effectiveEnvelopeCapacity =
    (wallCapacity + roofCapacity + floorCapacity) * ACTIVE_ENVELOPE_THERMAL_FRACTION;
  const effectiveIndoorCapacity = airCapacity + effectiveEnvelopeCapacity;

  let currentIndoor = initial_indoor_temperature_c;

  const hasThermalMass = Boolean(design.thermal_mass);
  let currentMass: number | null = hasThermalMass
    ? design.thermal_mass!.initial_temperature_c
    : null;
  const massCapacity = hasThermalMass
    ? design.thermal_mass!.mass_kg * design.thermal_mass!.specific_heat_j_kgk
    : 0;
  const massCoupling = hasThermalMass
    ? design.thermal_mass!.coupling_w_per_k
    : 0;

  const points: TransientSimulationPoint[] = [];
  let comfortSeconds = 0;
  let coldSeconds = 0;
  let hotSeconds = 0;

  const comfortMin = design.comfort?.minimum_c ?? 18.0;
  const comfortMax = design.comfort?.maximum_c ?? 26.0;

  for (let i = 0; i < weather.length; i++) {
    const w = weather[i];

    // Compute solar position and window solar gain
    const solarPos = calculateSolarPosition(
      w.timestamp,
      design.location.latitude,
      design.location.longitude
    );

    const ghi = w.solar_irradiance_w_m2 ?? 0;
    const dni = w.direct_normal_irradiance_w_m2 ?? (ghi * 0.7);
    const dhi = w.diffuse_radiation_w_m2 ?? (ghi * 0.3);

    const solarGainW = calculateWindowSolarGain(
      design.windows,
      design.orientation_deg,
      solarPos.zenithDeg,
      solarPos.azimuthDeg,
      ghi,
      dni,
      dhi
    );

    const heatBalance = calculateHeatBalance({
      geometry: design.geometry,
      wall_assembly: design.wall_assembly,
      roof_assembly: design.roof_assembly,
      floor_assembly: design.floor_assembly,
      windows: design.windows,
      doors: design.doors,
      ventilation: design.ventilation,
      indoor_temperature_c: currentIndoor,
      outdoor_temperature_c: w.outdoor_temperature_c,
      ground_temperature_c: w.ground_temperature_c,
      solar_gain_w: solarGainW,
      internal_heat_gain_w,
    });

    let timestepHours = timestep_minutes / 60.0;
    if (i < weather.length - 1) {
      const diffMs =
        new Date(weather[i + 1].timestamp).getTime() - new Date(w.timestamp).getTime();
      if (diffMs > 0) {
        timestepHours = diffMs / 3600000.0;
      }
    }
    const timestepSeconds = timestepHours * 3600.0;

    let massTransferW = 0.0;
    if (currentMass !== null && massCoupling > 0) {
      massTransferW = massCoupling * (currentMass - currentIndoor);
    }

    const netIndoorGainW = heatBalance.net_gain_w + massTransferW;
    const indoorDeltaT =
      (netIndoorGainW * timestepSeconds) / (effectiveIndoorCapacity || 1);

    let massDeltaT = 0.0;
    if (currentMass !== null && massCapacity > 0) {
      massDeltaT = (-massTransferW * timestepSeconds) / massCapacity;
    }

    const currentMassVal = currentMass !== null ? currentMass : currentIndoor;

    points.push({
      timestamp: w.timestamp,
      indoor_temperature_c: Math.round(currentIndoor * 1000) / 1000,
      thermal_mass_temperature_c: Math.round(currentMassVal * 1000) / 1000,
      outdoor_temperature_c: Math.round(w.outdoor_temperature_c * 1000) / 1000,
      solar_irradiance_w_m2: Math.round(ghi * 1000) / 1000,
      solar_gain_w: Math.round(solarGainW * 1000) / 1000,
      wall_heat_transfer_w: Math.round(heatBalance.wall_w * 1000) / 1000,
      roof_heat_transfer_w: Math.round(heatBalance.roof_w * 1000) / 1000,
      floor_heat_transfer_w: Math.round(heatBalance.floor_w * 1000) / 1000,
      window_heat_transfer_w: Math.round(heatBalance.windows_w * 1000) / 1000,
      door_heat_transfer_w: Math.round(heatBalance.doors_w * 1000) / 1000,
      ventilation_heat_transfer_w: Math.round(heatBalance.ventilation_w * 1000) / 1000,
      thermal_mass_heat_transfer_w: Math.round(massTransferW * 1000) / 1000,
      total_heat_loss_w: Math.round(heatBalance.total_loss_w * 1000) / 1000,
      net_heat_gain_w: Math.round(netIndoorGainW * 1000) / 1000,
    });

    if (currentIndoor >= comfortMin && currentIndoor <= comfortMax) {
      comfortSeconds += timestepSeconds;
    } else if (currentIndoor < comfortMin) {
      coldSeconds += timestepSeconds;
    } else {
      hotSeconds += timestepSeconds;
    }

    currentIndoor += indoorDeltaT;
    if (currentMass !== null) {
      currentMass += massDeltaT;
    }
  }

  const indoorTemps = points.map((p) => p.indoor_temperature_c);
  const massTemps = points.map((p) => p.thermal_mass_temperature_c);
  const totalSeconds = comfortSeconds + coldSeconds + hotSeconds;
  const comfortPct = totalSeconds > 0 ? (comfortSeconds / totalSeconds) * 100.0 : 0.0;

  return {
    initial_indoor_temperature_c,
    final_indoor_temperature_c: Math.round(currentIndoor * 1000) / 1000,
    minimum_indoor_temperature_c: Math.round(Math.min(...indoorTemps) * 1000) / 1000,
    maximum_indoor_temperature_c: Math.round(Math.max(...indoorTemps) * 1000) / 1000,
    initial_thermal_mass_temperature_c: hasThermalMass
      ? design.thermal_mass!.initial_temperature_c
      : null,
    final_thermal_mass_temperature_c:
      currentMass !== null ? Math.round(currentMass * 1000) / 1000 : null,
    minimum_thermal_mass_temperature_c: hasThermalMass
      ? Math.round(Math.min(...massTemps) * 1000) / 1000
      : null,
    maximum_thermal_mass_temperature_c: hasThermalMass
      ? Math.round(Math.max(...massTemps) * 1000) / 1000
      : null,
    comfort_hours: Math.round((comfortSeconds / 3600.0) * 1000) / 1000,
    cold_hours: Math.round((coldSeconds / 3600.0) * 1000) / 1000,
    hot_hours: Math.round((hotSeconds / 3600.0) * 1000) / 1000,
    comfort_percentage: Math.round(comfortPct * 100) / 100,
    points,
  };
}
