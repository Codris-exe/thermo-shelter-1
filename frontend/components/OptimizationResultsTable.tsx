"use client";

interface OptimizationCandidate {
  rank: number;
  orientation_deg: number;
  wall_insulation_thickness_mm: number;
  roof_insulation_thickness_mm: number;
  comfort_percentage: number;
  comfort_hours: number;
  minimum_indoor_temperature_c: number;
  maximum_indoor_temperature_c: number;
  final_indoor_temperature_c: number;
}

interface OptimizationResultsTableProps {
  candidates: OptimizationCandidate[];
  totalCandidates: number;
}

export default function OptimizationResultsTable({
  candidates,
  totalCandidates,
}: OptimizationResultsTableProps) {
  if (!candidates.length) {
    return null;
  }

  const visibleCandidates = candidates.slice(0, 5);

  return (
    <div className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090e1b] shadow-sm p-3 corner-bracket font-mono">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Optimization Candidates
          </div>

          <div className="mt-0.5 text-[9px] text-slate-500 dark:text-slate-400">
            Top ranked architectural iterations
          </div>
        </div>

        <div className="border border-amber-600/30 bg-amber-50 dark:bg-amber-400/10 px-2 py-0.5 text-[9px] text-amber-800 dark:text-amber-300 font-bold uppercase rounded">
          {totalCandidates} Tested
        </div>
      </div>

      <div className="overflow-hidden border border-slate-200 dark:border-white/10 rounded-lg">
        <div className="grid grid-cols-[32px_48px_62px_62px_1fr] bg-slate-50 dark:bg-[#060913] px-2 py-2 text-[8px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <div>#</div>
          <div>Orient.</div>
          <div>Wall</div>
          <div>Roof</div>
          <div>Comfort</div>
        </div>

        {visibleCandidates.map((candidate) => (
          <div
            key={`${candidate.rank}-${candidate.orientation_deg}-${candidate.wall_insulation_thickness_mm}-${candidate.roof_insulation_thickness_mm}`}
            className={`grid grid-cols-[32px_48px_62px_62px_1fr] items-center border-t border-slate-200 dark:border-white/10 px-2 py-2 text-[10px] ${
              candidate.rank === 1
                ? "bg-amber-50/80 dark:bg-amber-400/10"
                : ""
            }`}
          >
            <div
              className={
                candidate.rank === 1
                  ? "font-bold text-amber-700 dark:text-amber-400"
                  : "text-slate-500 dark:text-slate-400"
              }
            >
              {candidate.rank}
            </div>

            <div className="text-slate-800 dark:text-slate-200 font-medium">
              {candidate.orientation_deg}°
            </div>

            <div className="text-slate-800 dark:text-slate-200 font-medium">
              {candidate.wall_insulation_thickness_mm.toFixed(
                0,
              )}{" "}
              mm
            </div>

            <div className="text-slate-800 dark:text-slate-200 font-medium">
              {candidate.roof_insulation_thickness_mm.toFixed(
                0,
              )}{" "}
              mm
            </div>

            <div className="flex items-center justify-between gap-2">
              <span
                className={
                  candidate.rank === 1
                    ? "font-bold text-emerald-700 dark:text-emerald-400"
                    : "text-slate-800 dark:text-slate-200 font-medium"
                }
              >
                {candidate.comfort_percentage.toFixed(1)}%
              </span>

              <span className="text-[8px] text-slate-400 dark:text-slate-500">
                {candidate.comfort_hours.toFixed(1)} h
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 text-[9px] leading-relaxed text-slate-400 dark:text-slate-500">
        Candidates are ordered using simulated comfort percentage,
        comfort hours, and indoor temperature range.
      </div>
    </div>
  );
}