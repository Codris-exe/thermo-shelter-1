"use client";

import { useState } from "react";

interface DemoRunButtonProps {
  onRunDemo: () => Promise<void>;
  disabled?: boolean;
}

export default function DemoRunButton({
  onRunDemo,
  disabled = false,
}: DemoRunButtonProps) {
  const [isRunning, setIsRunning] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleRunDemo() {
    setIsRunning(true);
    setError("");

    try {
      await onRunDemo();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "The demo workflow failed.",
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-white">
            Hackathon Demo
          </div>

          <div className="mt-0.5 text-[9px] text-slate-500">
            Run the complete analysis workflow
          </div>
        </div>

        <div className="rounded-full border border-amber-400/20 bg-amber-400/5 px-2 py-1 text-[8px] text-amber-300">
          DEMO
        </div>
      </div>

      <button
        type="button"
        onClick={handleRunDemo}
        disabled={
          disabled ||
          isRunning
        }
        className="mt-3 w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRunning
          ? "Running Full Analysis..."
          : "Run Full Demo"}
      </button>

      <div className="mt-2 text-[8px] leading-relaxed text-slate-600">
        Uses the current shelter design, real weather data,
        thermal simulation and the configured optimization search.
      </div>

      {error && (
        <div className="mt-2 rounded-lg border border-red-400/20 bg-red-400/5 p-2 text-[9px] leading-relaxed text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}