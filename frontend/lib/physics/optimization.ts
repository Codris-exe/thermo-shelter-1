import {
  SimulationShelterDesign,
  SimulationWeatherInputPoint,
  runTransientSimulation,
} from "./simulation";
import { MaterialLayer } from "./envelope";

export interface OptimizationCandidate {
  rank: number;
  orientation_deg: number;
  wall_insulation_thickness_mm: number;
  roof_insulation_thickness_mm: number;
  comfort_percentage: number;
  comfort_hours: number;
  minimum_indoor_temperature_c: number;
  maximum_indoor_temperature_c: number;
  final_indoor_temperature_c: number;
}

export interface OptimizationResult {
  total_candidates_tested: number;
  baseline_comfort_percentage: number;
  best_candidate: OptimizationCandidate;
  candidates: OptimizationCandidate[];
}

const INSULATION_MATERIALS = new Set(["rock_wool", "eps", "xps"]);

function updateInsulationLayers(
  layers: MaterialLayer[],
  thicknessMm: number
): MaterialLayer[] {
  const thicknessM = thicknessMm / 1000.0;
  const updated = layers.map((l) => ({ ...l }));
  const existingIdx = updated.findIndex((l) => INSULATION_MATERIALS.has(l.material_id));

  if (existingIdx >= 0) {
    updated[existingIdx].thickness_m = thicknessM;
    return updated;
  }

  updated.push({
    material_id: "rock_wool",
    thickness_m: thicknessM,
  });
  return updated;
}

export function runOptimization(params: {
  design: SimulationShelterDesign;
  initial_indoor_temperature_c: number;
  weather: SimulationWeatherInputPoint[];
  wall_insulation_thicknesses_mm: number[];
  roof_insulation_thicknesses_mm: number[];
  orientations_deg: number[];
  internal_heat_gain_w?: number;
  timestep_minutes?: number;
}): OptimizationResult {
  const {
    design,
    initial_indoor_temperature_c,
    weather,
    wall_insulation_thicknesses_mm,
    roof_insulation_thicknesses_mm,
    orientations_deg,
    internal_heat_gain_w = 0,
    timestep_minutes = 60,
  } = params;

  // Run baseline
  const baseline = runTransientSimulation({
    design,
    initial_indoor_temperature_c,
    weather,
    internal_heat_gain_w,
    timestep_minutes,
  });

  const candidates: OptimizationCandidate[] = [];

  for (const orientation of orientations_deg) {
    for (const wallThick of wall_insulation_thicknesses_mm) {
      for (const roofThick of roof_insulation_thicknesses_mm) {
        const candidateDesign: SimulationShelterDesign = {
          ...design,
          orientation_deg: orientation,
          wall_assembly: {
            layers: updateInsulationLayers(design.wall_assembly.layers, wallThick),
          },
          roof_assembly: {
            layers: updateInsulationLayers(design.roof_assembly.layers, roofThick),
          },
        };

        const sim = runTransientSimulation({
          design: candidateDesign,
          initial_indoor_temperature_c,
          weather,
          internal_heat_gain_w,
          timestep_minutes,
        });

        candidates.push({
          rank: 0,
          orientation_deg: orientation,
          wall_insulation_thickness_mm: wallThick,
          roof_insulation_thickness_mm: roofThick,
          comfort_percentage: sim.comfort_percentage,
          comfort_hours: sim.comfort_hours,
          minimum_indoor_temperature_c: sim.minimum_indoor_temperature_c,
          maximum_indoor_temperature_c: sim.maximum_indoor_temperature_c,
          final_indoor_temperature_c: sim.final_indoor_temperature_c,
        });
      }
    }
  }

  // Sort candidates by:
  // 1. Max comfort percentage
  // 2. Max comfort hours
  // 3. Min diurnal indoor temperature swing
  candidates.sort((a, b) => {
    if (b.comfort_percentage !== a.comfort_percentage) {
      return b.comfort_percentage - a.comfort_percentage;
    }
    if (b.comfort_hours !== a.comfort_hours) {
      return b.comfort_hours - a.comfort_hours;
    }
    const rangeA = a.maximum_indoor_temperature_c - a.minimum_indoor_temperature_c;
    const rangeB = b.maximum_indoor_temperature_c - b.minimum_indoor_temperature_c;
    return rangeA - rangeB;
  });

  const rankedCandidates = candidates.map((c, idx) => ({
    ...c,
    rank: idx + 1,
  }));

  return {
    total_candidates_tested: rankedCandidates.length,
    baseline_comfort_percentage: baseline.comfort_percentage,
    best_candidate: rankedCandidates[0],
    candidates: rankedCandidates,
  };
}
