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
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-white">
            Optimization Search
          </div>

          <div className="mt-0.5 text-[9px] text-slate-500">
            Top 5 candidates from the tested design space
          </div>
        </div>

        <div className="rounded-full border border-violet-400/20 bg-violet-400/5 px-2 py-1 text-[9px] text-violet-300">
          {totalCandidates} tested
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10">
        <div className="grid grid-cols-[32px_48px_62px_62px_1fr] bg-white/[0.04] px-2 py-2 text-[8px] uppercase tracking-wide text-slate-500">
          <div>#</div>
          <div>Orient.</div>
          <div>Wall</div>
          <div>Roof</div>
          <div>Comfort</div>
        </div>

        {visibleCandidates.map((candidate) => (
          <div
            key={`${candidate.rank}-${candidate.orientation_deg}-${candidate.wall_insulation_thickness_mm}-${candidate.roof_insulation_thickness_mm}`}
            className={`grid grid-cols-[32px_48px_62px_62px_1fr] items-center border-t border-white/5 px-2 py-2 text-[10px] ${
              candidate.rank === 1
                ? "bg-violet-400/[0.08]"
                : ""
            }`}
          >
            <div
              className={
                candidate.rank === 1
                  ? "font-bold text-violet-300"
                  : "text-slate-500"
              }
            >
              {candidate.rank}
            </div>

            <div className="text-slate-300">
              {candidate.orientation_deg}°
            </div>

            <div className="text-slate-300">
              {candidate.wall_insulation_thickness_mm.toFixed(
                0,
              )}{" "}
              mm
            </div>

            <div className="text-slate-300">
              {candidate.roof_insulation_thickness_mm.toFixed(
                0,
              )}{" "}
              mm
            </div>

            <div className="flex items-center justify-between gap-2">
              <span
                className={
                  candidate.rank === 1
                    ? "font-semibold text-emerald-300"
                    : "text-slate-300"
                }
              >
                {candidate.comfort_percentage.toFixed(1)}%
              </span>

              <span className="text-[8px] text-slate-600">
                {candidate.comfort_hours.toFixed(1)} h
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 text-[9px] leading-relaxed text-slate-600">
        Candidates are ordered using simulated comfort percentage,
        comfort hours, and indoor temperature range.
      </div>
    </div>
  );
}