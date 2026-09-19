import { NextRequest, NextResponse } from "next/server";
import { runTransientSimulation } from "../../../../../lib/physics/simulation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      design,
      initial_indoor_temperature_c,
      weather,
      internal_heat_gain_w = 0,
      timestep_minutes = 60,
    } = body;

    if (!design || !weather || initial_indoor_temperature_c === undefined) {
      return NextResponse.json(
        { detail: "design, weather, and initial_indoor_temperature_c are required." },
        { status: 400 }
      );
    }

    const result = runTransientSimulation({
      design,
      initial_indoor_temperature_c,
      weather,
      internal_heat_gain_w,
      timestep_minutes,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Simulation run error:", error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Simulation failed." },
      { status: 400 }
    );
  }
}
