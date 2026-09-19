import { NextRequest, NextResponse } from "next/server";
import { calculateHeatBalance } from "../../../../../lib/physics/heatBalance";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      design,
      indoor_temperature_c,
      weather,
      internal_heat_gain_w = 0,
    } = body;

    const result = calculateHeatBalance({
      geometry: design.geometry,
      wall_assembly: design.wall_assembly,
      roof_assembly: design.roof_assembly,
      floor_assembly: design.floor_assembly,
      windows: design.windows,
      doors: design.doors,
      ventilation: design.ventilation,
      indoor_temperature_c,
      outdoor_temperature_c: weather.outdoor_temperature_c,
      ground_temperature_c: weather.ground_temperature_c,
      solar_gain_w: weather.solar_gain_w || 0,
      internal_heat_gain_w,
    });

    return NextResponse.json({
      timestamp: weather.timestamp,
      wall_heat_transfer_w: result.wall_w,
      roof_heat_transfer_w: result.roof_w,
      floor_heat_transfer_w: result.floor_w,
      window_heat_transfer_w: result.windows_w,
      door_heat_transfer_w: result.doors_w,
      ventilation_heat_transfer_w: result.ventilation_w,
      conductive_heat_transfer_w: result.conductive_w,
      total_heat_loss_w: result.total_loss_w,
      solar_gain_w: result.solar_gain_w,
      internal_heat_gain_w: result.internal_gain_w,
      net_heat_gain_w: result.net_gain_w,
      indoor_temperature_c,
      outdoor_temperature_c: weather.outdoor_temperature_c,
    });
  } catch (error) {
    console.error("Heat balance error:", error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Heat balance calculation failed." },
      { status: 400 }
    );
  }
}
