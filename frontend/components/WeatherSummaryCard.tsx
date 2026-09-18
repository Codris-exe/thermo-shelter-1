"use client";

interface WeatherPoint {
  timestamp: string;
  outdoor_temperature_c: number;
  wind_speed_m_s?: number;
  solar_irradiance_w_m2?: number;
  cloud_cover_pct?: number | null;
  relative_humidity_pct?: number | null;
  is_day?: boolean;
}

interface WeatherSummaryCardProps {
  points: WeatherPoint[];
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WeatherSummaryCard({
  points,
}: WeatherSummaryCardProps) {
  if (!points.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div className="text-xs font-semibold text-white">
          Live Weather
        </div>

        <div className="mt-2 text-[10px] text-slate-500">
          Weather data will appear after the first simulation or
          optimization run.
        </div>
      </div>
    );
  }

  const current = points[0];

  const temperatures = points.map(
    (point) => point.outdoor_temperature_c,
  );

  const minimumTemperature = Math.min(...temperatures);
  const maximumTemperature = Math.max(...temperatures);

  return (
    <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-white">
            Live Weather
          </div>

          <div className="mt-0.5 text-[9px] text-emerald-400">
            Real forecast data
          </div>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] text-slate-400">
          {formatTime(current.timestamp)}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
          <div className="text-[8px] uppercase tracking-wide text-slate-500">
            Outdoor
          </div>

          <div className="mt-1 text-lg font-semibold text-blue-300">
            {current.outdoor_temperature_c.toFixed(1)}°C
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
          <div className="text-[8px] uppercase tracking-wide text-slate-500">
            Solar
          </div>

          <div className="mt-1 text-lg font-semibold text-amber-300">
            {(
              current.solar_irradiance_w_m2 ?? 0
            ).toFixed(0)}{" "}
            W/m²
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
          <div className="text-[8px] uppercase tracking-wide text-slate-500">
            Wind
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {(current.wind_speed_m_s ?? 0).toFixed(1)} m/s
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
          <div className="text-[8px] uppercase tracking-wide text-slate-500">
            Humidity
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {current.relative_humidity_pct != null
              ? `${current.relative_humidity_pct.toFixed(0)}%`
              : "—"}
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-[9px]">
        <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1.5">
          <span className="text-slate-500">
            24h min
          </span>

          <span className="text-blue-300">
            {minimumTemperature.toFixed(1)}°C
          </span>
        </div>

        <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1.5">
          <span className="text-slate-500">
            24h max
          </span>

          <span className="text-orange-300">
            {maximumTemperature.toFixed(1)}°C
          </span>
        </div>
      </div>

      <div className="mt-2 text-[9px] text-slate-600">
        Source: Open-Meteo forecast
      </div>
    </div>
  );
}