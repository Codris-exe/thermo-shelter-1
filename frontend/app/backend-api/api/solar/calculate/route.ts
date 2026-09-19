import { NextRequest, NextResponse } from "next/server";
import { calculateSolarPosition, calculateWindowSolarGain } from "../../../../../lib/physics/solar";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      design,
      timestamp,
      latitude,
      longitude,
      solar_irradiance_w_m2 = 0,
      direct_radiation_w_m2 = 0,
      diffuse_radiation_w_m2 = 0,
      direct_normal_irradiance_w_m2 = 0,
    } = body;

    const solarPos = calculateSolarPosition(timestamp, latitude, longitude);

    const windowSolarGainW = calculateWindowSolarGain(
      design.windows || [],
      design.orientation_deg || 180,
      solarPos.zenithDeg,
      solarPos.azimuthDeg,
      solar_irradiance_w_m2,
      direct_normal_irradiance_w_m2 || direct_radiation_w_m2,
      diffuse_radiation_w_m2
    );

    return NextResponse.json({
      timestamp,
      solar_zenith_deg: solarPos.zenithDeg,
      solar_azimuth_deg: solarPos.azimuthDeg,
      total_incident_power_w: solar_irradiance_w_m2 * 20.0,
      total_opaque_absorbed_power_w: solar_irradiance_w_m2 * 20.0 * 0.65,
      total_window_solar_gain_w: windowSolarGainW,
      surfaces: [],
      windows: [],
    });
  } catch (error) {
    console.error("Solar calculation error:", error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Solar calculation failed." },
      { status: 400 }
    );
  }
}
