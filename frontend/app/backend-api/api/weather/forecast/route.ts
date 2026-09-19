import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("latitude");
  const lonStr = searchParams.get("longitude");
  const hoursStr = searchParams.get("hours") || "24";

  if (!latStr || !lonStr) {
    return NextResponse.json(
      { detail: "latitude and longitude parameters are required." },
      { status: 400 }
    );
  }

  const latitude = parseFloat(latStr);
  const longitude = parseFloat(lonStr);
  const hours = Math.min(48, Math.max(1, parseInt(hoursStr, 10) || 24));

  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    return NextResponse.json({ detail: "Latitude must be between -90 and 90." }, { status: 400 });
  }
  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    return NextResponse.json({ detail: "Longitude must be between -180 and 180." }, { status: 400 });
  }

  try {
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

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=${hourlyVars}&forecast_hours=${hours}&temperature_unit=celsius&wind_speed_unit=ms&timezone=auto`;

    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) {
      throw new Error(`Open-Meteo forecast returned status ${res.status}`);
    }

    const data = await res.json();
    const hourly = data.hourly || {};
    const times = hourly.time || [];
    const temperatures = hourly.temperature_2m || [];
    const humidity = hourly.relative_humidity_2m || [];
    const windSpeed = hourly.wind_speed_10m || [];
    const windDirection = hourly.wind_direction_10m || [];
    const shortwave = hourly.shortwave_radiation || [];
    const direct = hourly.direct_radiation || [];
    const diffuse = hourly.diffuse_radiation || [];
    const dni = hourly.direct_normal_irradiance || [];
    const cloudCover = hourly.cloud_cover || [];
    const isDay = hourly.is_day || [];

    const points = times.map((t: string, idx: number) => ({
      timestamp: t,
      outdoor_temperature_c: temperatures[idx] ?? 0,
      wind_speed_m_s: windSpeed[idx] ?? 0,
      solar_irradiance_w_m2: shortwave[idx] ?? 0.0,
      solar_gain_w: 0.0,
      relative_humidity_pct: humidity[idx] ?? null,
      ground_temperature_c: null,
      wind_direction_deg: windDirection[idx] ?? 0,
      direct_radiation_w_m2: direct[idx] ?? 0.0,
      diffuse_radiation_w_m2: diffuse[idx] ?? 0.0,
      direct_normal_irradiance_w_m2: dni[idx] ?? 0.0,
      cloud_cover_pct: cloudCover[idx] ?? null,
      is_day: Boolean(isDay[idx]),
    }));

    return NextResponse.json({
      latitude: data.latitude,
      longitude: data.longitude,
      elevation_m: data.elevation,
      timezone: data.timezone,
      timezone_abbreviation: data.timezone_abbreviation,
      source: "Open-Meteo",
      points,
    });
  } catch (error) {
    console.error("Forecast route error:", error);
    return NextResponse.json(
      { detail: "Unable to retrieve weather data from Open-Meteo." },
      { status: 502 }
    );
  }
}
