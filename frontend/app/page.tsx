"use client";

import { useEffect, useState } from "react";

interface HealthResponse {
  status: string;
  service: string;
}

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "connected" | "error"
  >("checking");

  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch("/backend-api/api/health");

        if (!response.ok) {
          throw new Error("Backend request failed");
        }

        const data: HealthResponse = await response.json();

        setHealth(data);
        setBackendStatus("connected");
      } catch (error) {
        console.error("Backend connection error:", error);
        setBackendStatus("error");
      }
    };

    checkBackend();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12">
        <header className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Passive Shelter Engineering
          </p>

          <h1 className="text-5xl font-bold tracking-tight">
            Thermo Shelter 1
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            Physics-based passive shelter thermal simulation, real weather
            analysis, 3D visualization, and design optimization.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">System Status</p>

            <div className="mt-4 flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  backendStatus === "connected"
                    ? "bg-emerald-400"
                    : backendStatus === "error"
                      ? "bg-red-400"
                      : "bg-yellow-400"
                }`}
              />

              <span className="text-xl font-semibold">
                {backendStatus === "connected"
                  ? "Backend Connected"
                  : backendStatus === "error"
                    ? "Backend Connection Failed"
                    : "Checking Backend..."}
              </span>
            </div>

            {health && (
              <div className="mt-5 space-y-2 text-sm text-slate-400">
                <p>
                  Status:{" "}
                  <span className="text-white">{health.status}</span>
                </p>

                <p>
                  Service:{" "}
                  <span className="text-white">{health.service}</span>
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Current Phase</p>

            <h2 className="mt-3 text-2xl font-semibold">
              Phase 1 — Foundation
            </h2>

            <p className="mt-3 text-slate-400">
              Next.js frontend and FastAPI backend are being connected as the
              foundation for the thermal simulation engine.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-cyan-900/50 bg-cyan-950/20 p-6">
          <h2 className="text-xl font-semibold text-cyan-300">
            Thermo Shelter Architecture
          </h2>

          <div className="mt-6 grid gap-4 text-center sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-lg font-semibold">Frontend</p>
              <p className="mt-2 text-sm text-slate-400">
                Next.js + React + TypeScript
              </p>
            </div>

            <div className="flex items-center justify-center text-2xl text-cyan-400 sm:hidden">
              ↓
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-lg font-semibold">Backend</p>
              <p className="mt-2 text-sm text-slate-400">
                FastAPI + Python
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-lg font-semibold">Future Engine</p>
              <p className="mt-2 text-sm text-slate-400">
                Thermal + Solar + Optimization
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-auto pt-12 text-sm text-slate-500">
          Thermo Shelter 1 • Engineering Simulation Platform
        </footer>
      </div>
    </main>
  );
}