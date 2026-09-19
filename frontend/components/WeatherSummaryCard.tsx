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
  if (timestamp.includes("T")) {
    return timestamp.split("T")[1].slice(0, 5);
  }
  return timestamp;
}

export default function WeatherSummaryCard({
  points,
}: WeatherSummaryCardProps) {
  if (!points.length) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090e1b] p-3 font-mono">
        <div className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
          Live Weather
        </div>

        <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
          Weather data will appear after the first simulation or optimization run.
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
    <div className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090e1b] shadow-sm p-3 corner-bracket font-mono">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Live Weather Telemetry
          </div>

          <div className="mt-0.5 text-[9px] text-amber-600 dark:text-amber-400 font-bold">
            Open-Meteo Satellite Sync
          </div>
        </div>

        <div className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#0b1120] px-2 py-1 text-[9px] text-slate-600 dark:text-slate-300">
          {formatTime(current.timestamp)}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060913] p-2">
          <div className="text-[8px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Outdoor
          </div>

          <div className="mt-1 text-lg font-bold text-sky-700 dark:text-sky-400">
            {current.outdoor_temperature_c.toFixed(1)}°C
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060913] p-2">
          <div className="text-[8px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Solar
          </div>

          <div className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400">
            {(
              current.solar_irradiance_w_m2 ?? 0
            ).toFixed(0)}{" "}
            W/m²
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060913] p-2">
          <div className="text-[8px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Wind
          </div>

          <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
            {(current.wind_speed_m_s ?? 0).toFixed(1)} m/s
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060913] p-2">
          <div className="text-[8px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Humidity
          </div>

          <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
            {current.relative_humidity_pct != null
              ? `${current.relative_humidity_pct.toFixed(0)}%`
              : "—"}
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-[9px]">
        <div className="flex justify-between rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060913] px-2 py-1.5">
          <span className="text-slate-500 dark:text-slate-400">
            24h min
          </span>

          <span className="text-sky-700 dark:text-sky-400 font-bold">
            {minimumTemperature.toFixed(1)}°C
          </span>
        </div>

        <div className="flex justify-between rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060913] px-2 py-1.5">
          <span className="text-slate-500 dark:text-slate-400">
            24h max
          </span>

          <span className="text-orange-600 dark:text-orange-400 font-bold">
            {maximumTemperature.toFixed(1)}°C
          </span>
        </div>
      </div>

      <div className="mt-2 text-[9px] text-slate-400 dark:text-slate-500">
        Source: Open-Meteo forecast
      </div>
    </div>
  );
}