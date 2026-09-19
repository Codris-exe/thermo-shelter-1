import { NextRequest, NextResponse } from "next/server";
import { runOptimization } from "../../../../../lib/physics/optimization";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      design,
      initial_indoor_temperature_c,
      weather,
      wall_insulation_thicknesses_mm = [50, 100, 150, 200],
      roof_insulation_thicknesses_mm = [80, 120, 160, 200],
      orientations_deg = [0, 90, 180, 270],
      internal_heat_gain_w = 0,
      timestep_minutes = 60,
    } = body;

    if (!design || !weather || initial_indoor_temperature_c === undefined) {
      return NextResponse.json(
        { detail: "design, weather, and initial_indoor_temperature_c are required." },
        { status: 400 }
      );
    }

    const result = runOptimization({
      design,
      initial_indoor_temperature_c,
      weather,
      wall_insulation_thicknesses_mm,
      roof_insulation_thicknesses_mm,
      orientations_deg,
      internal_heat_gain_w,
      timestep_minutes,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Optimization run error:", error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Optimization failed." },
      { status: 400 }
    );
  }
}
