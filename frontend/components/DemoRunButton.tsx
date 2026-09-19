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
    <div className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090e1b] shadow-sm p-3 corner-bracket font-mono">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Automated Analysis Run
          </div>

          <div className="mt-0.5 text-[9px] text-slate-500 dark:text-slate-400">
            End-to-end telemetry, simulation &amp; Pareto sweep
          </div>
        </div>

        <div className="border border-amber-600/30 bg-amber-50 dark:bg-amber-400/10 px-2 py-0.5 text-[8px] text-amber-800 dark:text-amber-300 font-bold uppercase rounded">
          AUTOMATED
        </div>
      </div>

      <button
        type="button"
        onClick={handleRunDemo}
        disabled={
          disabled ||
          isRunning
        }
        className="mt-3 w-full chamfer-btn bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-mono font-bold tracking-wider uppercase text-slate-950 transition-colors disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
      >
        <span className="w-2 h-2 rounded-full bg-slate-950 status-ping" />
        <span>{isRunning ? "Executing Pipeline..." : "Execute Automated Workflow"}</span>
        <span className="text-sm">→</span>
      </button>

      <div className="mt-2 text-[9px] leading-relaxed text-slate-500 dark:text-slate-400">
        Executes real climate ingestion, transient forward Euler solver, and combinatorial parameter optimization.
      </div>

      {error && (
        <div className="mt-2 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-2 text-[9px] leading-relaxed text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}