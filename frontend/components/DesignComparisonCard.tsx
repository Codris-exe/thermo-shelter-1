"use client";

interface DesignSnapshot {
  orientation_deg: number;
  wall_insulation_thickness_mm: number;
  roof_insulation_thickness_mm: number;
  comfort_percentage?: number | null;
  minimum_indoor_temperature_c?: number | null;
  maximum_indoor_temperature_c?: number | null;
}

interface DesignComparisonCardProps {
  baseline: DesignSnapshot;
  optimized: DesignSnapshot;
  isApplied?: boolean;
}

function formatValue(
  value: number | null | undefined,
  suffix = "",
) {
  if (value == null) {
    return "—";
  }

  return `${value.toFixed(1)}${suffix}`;
}

export default function DesignComparisonCard({
  baseline,
  optimized,
  isApplied = false,
}: DesignComparisonCardProps) {
  return (
    <div className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090e1b] shadow-sm p-3 corner-bracket font-mono">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Configuration Comparison
          </div>

          <div className="mt-0.5 text-[9px] text-slate-500 dark:text-slate-400">
            Baseline envelope vs optimized architectural model
          </div>
        </div>

        {isApplied && (
          <div className="border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-400/10 px-2 py-0.5 text-[9px] text-emerald-700 dark:text-emerald-300 font-bold uppercase rounded">
            Active in 3D
          </div>
        )}
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-2">
        {/* Baseline */}
        <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060913] p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Baseline
          </div>

          <div className="mt-2 space-y-2">
            <div>
              <div className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">
                Orientation
              </div>

              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {baseline.orientation_deg}°
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">
                Wall Insulation
              </div>

              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {baseline.wall_insulation_thickness_mm.toFixed(
                  0,
                )}{" "}
                mm
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">
                Roof Insulation
              </div>

              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {baseline.roof_insulation_thickness_mm.toFixed(
                  0,
                )}{" "}
                mm
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">
                Comfort
              </div>

              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {formatValue(
                  baseline.comfort_percentage,
                  "%",
                )}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">
                Temperature Range
              </div>

              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {formatValue(
                  baseline.minimum_indoor_temperature_c,
                  "°C",
                )}
                {" – "}
                {formatValue(
                  baseline.maximum_indoor_temperature_c,
                  "°C",
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Optimized */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-50/60 dark:bg-amber-400/10 p-2.5">
          <div className="text-[9px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
            Optimized Design
          </div>

          <div className="mt-2 space-y-2">
            <div>
              <div className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">
                Orientation
              </div>

              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {optimized.orientation_deg}°
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">
                Wall Insulation
              </div>

              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {optimized.wall_insulation_thickness_mm.toFixed(
                  0,
                )}{" "}
                mm
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">
                Roof Insulation
              </div>

              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {optimized.roof_insulation_thickness_mm.toFixed(
                  0,
                )}{" "}
                mm
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">
                Comfort
              </div>

              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {formatValue(
                  optimized.comfort_percentage,
                  "%",
                )}
              </div>
            </div>

            <div>
              <div className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">
                Temperature Range
              </div>

              <div className="text-xs font-bold text-sky-700 dark:text-sky-400">
                {formatValue(
                  optimized.minimum_indoor_temperature_c,
                  "°C",
                )}
                {" – "}
                {formatValue(
                  optimized.maximum_indoor_temperature_c,
                  "°C",
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-200 dark:border-white/10 pt-2">
        <div className="rounded-lg bg-slate-50 dark:bg-[#060913] border border-slate-200 dark:border-white/10 px-2 py-1.5">
          <div className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">
            Wall Δ
          </div>

          <div className="text-[10px] font-bold text-slate-900 dark:text-white">
            {(
              optimized.wall_insulation_thickness_mm -
              baseline.wall_insulation_thickness_mm
            ).toFixed(0)}{" "}
            mm
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-[#060913] border border-slate-200 dark:border-white/10 px-2 py-1.5">
          <div className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">
            Roof Δ
          </div>

          <div className="text-[10px] font-bold text-slate-900 dark:text-white">
            {(
              optimized.roof_insulation_thickness_mm -
              baseline.roof_insulation_thickness_mm
            ).toFixed(0)}{" "}
            mm
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-[#060913] border border-slate-200 dark:border-white/10 px-2 py-1.5">
          <div className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">
            Orientation Δ
          </div>

          <div className="text-[10px] font-bold text-slate-900 dark:text-white">
            {(
              optimized.orientation_deg -
              baseline.orientation_deg
            ).toFixed(0)}
            °
          </div>
        </div>
      </div>
    </div>
  );
}