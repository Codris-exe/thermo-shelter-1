import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (q.length < 2) {
    return NextResponse.json(
      { detail: "Location search must contain at least 2 characters." },
      { status: 400 }
    );
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      q
    )}&count=5&language=en&format=json`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`Open-Meteo geocoding error: ${res.statusText}`);
    }

    const data = await res.json();
    const rawResults = data.results || [];

    const locations = rawResults.map((r: Record<string, unknown>) => ({
      name: r.name,
      country: r.country ?? null,
      country_code: r.country_code ?? null,
      region: r.admin1 ?? null,
      latitude: r.latitude,
      longitude: r.longitude,
      elevation_m: r.elevation ?? null,
      timezone: r.timezone ?? null,
    }));

    return NextResponse.json({
      query: q,
      count: locations.length,
      results: locations,
    });
  } catch (error) {
    console.error("Geocoding route error:", error);
    return NextResponse.json(
      { detail: "Unable to contact the location service." },
      { status: 502 }
    );
  }
}
