import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function mean(arr: number[]): number | null {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function safeNum(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      latitude,
      longitude,
      start_date = "2016-01-01",
      end_date = "2025-12-31",
      timezone = "auto",
      model = "era5",
      month = null,
      aggregation = "hourly_profile",
      elevation_m = null,
    } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ detail: "latitude and longitude are required" }, { status: 400 });
    }

    const hourlyVars = [
      "temperature_2m",
      "relative_humidity_2m",
      "wind_speed_10m",
      "wind_direction_10m",
      "shortwave_radiation",
      "direct_radiation",
      "diffuse_radiation",
      "direct_normal_irradiance",
      "cloud_cover",
      "is_day",
    ].join(",");

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${start_date}&end_date=${end_date}&hourly=${hourlyVars}&timezone=${timezone}&wind_speed_unit=ms&temperature_unit=celsius&models=${model}`;

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      throw new Error(`Open-Meteo archive returned ${res.status}`);
    }

    const payload = await res.json();
    const hourly = payload.hourly || {};
    const times: string[] = hourly.time || [];

    const temps = hourly.temperature_2m || [];
    const humidities = hourly.relative_humidity_2m || [];
    const windSpeeds = hourly.wind_speed_10m || [];
    const shortwave = hourly.shortwave_radiation || [];
    const direct = hourly.direct_radiation || [];
    const diffuse = hourly.diffuse_radiation || [];
    const dni = hourly.direct_normal_irradiance || [];
    const cloud = hourly.cloud_cover || [];
    const isDay = hourly.is_day || [];

    // Group by hour (0 to 23)
    const hourlyGroups: Record<number, Array<{
      temp: number | null;
      hum: number | null;
      wind: number | null;
      solar: number | null;
      direct: number | null;
      diffuse: number | null;
      dni: number | null;
      cloud: number | null;
      isDay: boolean | null;
    }>> = {};

    for (let h = 0; h < 24; h++) {
      hourlyGroups[h] = [];
    }

    let sampleCount = 0;
    const yearsSet = new Set<number>();

    for (let i = 0; i < times.length; i++) {
      const date = new Date(times[i]);
      if (isNaN(date.getTime())) continue;

      if (month !== null && date.getUTCMonth() + 1 !== month) {
        continue;
      }

      sampleCount++;
      yearsSet.add(date.getUTCFullYear());

      const hour = date.getUTCHours();
      hourlyGroups[hour].push({
        temp: safeNum(temps[i]),
        hum: safeNum(humidities[i]),
        wind: safeNum(windSpeeds[i]),
        solar: safeNum(shortwave[i]),
        direct: safeNum(direct[i]),
        diffuse: safeNum(diffuse[i]),
        dni: safeNum(dni[i]),
        cloud: safeNum(cloud[i]),
        isDay: isDay[i] !== null && isDay[i] !== undefined ? Boolean(isDay[i]) : null,
      });
    }

    const climateProfile = [];
    for (let h = 0; h < 24; h++) {
      const g = hourlyGroups[h];
      const validTemps = g.map((p) => p.temp).filter((v): v is number => v !== null);
      const validHum = g.map((p) => p.hum).filter((v): v is number => v !== null);
      const validWind = g.map((p) => p.wind).filter((v): v is number => v !== null);
      const validSolar = g.map((p) => p.solar).filter((v): v is number => v !== null);
      const validDirect = g.map((p) => p.direct).filter((v): v is number => v !== null);
      const validDiffuse = g.map((p) => p.diffuse).filter((v): v is number => v !== null);
      const validDni = g.map((p) => p.dni).filter((v): v is number => v !== null);
      const validCloud = g.map((p) => p.cloud).filter((v): v is number => v !== null);
      const daySamples = g.filter((p) => p.isDay === true);

      climateProfile.push({
        hour_of_day: h,
        sample_count: g.length,
        average_temperature_c: mean(validTemps),
        minimum_temperature_c: validTemps.length ? Math.min(...validTemps) : null,
        maximum_temperature_c: validTemps.length ? Math.max(...validTemps) : null,
        average_relative_humidity_pct: mean(validHum),
        average_wind_speed_m_s: mean(validWind),
        average_solar_irradiance_w_m2: mean(validSolar),
        average_direct_radiation_w_m2: mean(validDirect),
        average_diffuse_radiation_w_m2: mean(validDiffuse),
        average_direct_normal_irradiance_w_m2: mean(validDni),
        average_cloud_cover_pct: mean(validCloud),
        daylight_fraction: g.length ? daySamples.length / g.length : null,
      });
    }

    return NextResponse.json({
      latitude,
      longitude,
      requested_start_date: start_date,
      requested_end_date: end_date,
      actual_start_date: times[0] ? times[0].split("T")[0] : start_date,
      actual_end_date: times[times.length - 1] ? times[times.length - 1].split("T")[0] : end_date,
      timezone: payload.timezone || timezone,
      model,
      elevation_m: elevation_m ?? payload.elevation ?? null,
      years_available: yearsSet.size || 10,
      hourly_samples: sampleCount,
      selected_month: month,
      profile_type: aggregation,
      climate_profile: climateProfile,
      source: "Open-Meteo ERA5",
    });
  } catch (error) {
    console.error("Historical weather error:", error);
    return NextResponse.json(
      { detail: `Historical weather service failed: ${error instanceof Error ? error.message : error}` },
      { status: 502 }
    );
  }
}
