"use client";

interface AnalysisPipelineCardProps {
  hasWeather: boolean;
  hasSimulation: boolean;
  hasOptimization: boolean;
}

interface PipelineStepProps {
  number: string;
  title: string;
  description: string;
  active: boolean;
  complete: boolean;
}

function PipelineStep({
  number,
  title,
  description,
  active,
  complete,
}: PipelineStepProps) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
          complete
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : active
              ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
              : "border-white/10 bg-white/[0.03] text-slate-600"
        }`}
      >
        {complete ? "✓" : number}
      </div>

      <div className="min-w-0">
        <div
          className={`text-[10px] font-semibold ${
            complete
              ? "text-emerald-300"
              : active
                ? "text-cyan-300"
                : "text-slate-500"
          }`}
        >
          {title}
        </div>

        <div className="mt-0.5 text-[8px] leading-relaxed text-slate-600">
          {description}
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPipelineCard({
  hasWeather,
  hasSimulation,
  hasOptimization,
}: AnalysisPipelineCardProps) {
  return (
    <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.025] p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-white">
            Analysis Pipeline
          </div>

          <div className="mt-0.5 text-[9px] text-slate-500">
            How the shelter design is evaluated
          </div>
        </div>

        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-2 py-1 text-[8px] text-cyan-300">
          LIVE
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <PipelineStep
          number="1"
          title="Location"
          description="Shelter coordinates define the climate context."
          active
          complete={hasWeather}
        />

        <PipelineStep
          number="2"
          title="Real Weather"
          description="Forecast temperature, wind and radiation drive the model."
          active={hasWeather}
          complete={hasWeather}
        />

        <PipelineStep
          number="3"
          title="Solar Model"
          description="Solar position and surface radiation are evaluated."
          active={hasSimulation}
          complete={hasSimulation}
        />

        <PipelineStep
          number="4"
          title="Thermal Engine"
          description="Envelope, ventilation, thermal mass and solar gains are simulated."
          active={hasSimulation}
          complete={hasSimulation}
        />

        <PipelineStep
          number="5"
          title="Optimization"
          description="Tested configurations are compared using the thermal model."
          active={hasOptimization}
          complete={hasOptimization}
        />
      </div>

      <div className="mt-3 border-t border-white/5 pt-2 text-[8px] leading-relaxed text-slate-600">
        The pipeline uses the same design state throughout the
        visualization, simulation and optimization workflow.
      </div>
    </div>
  );
}