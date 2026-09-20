"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAsPreset, getStoredUser, clearAuth } from "@/lib/auth";

function AccountSelect() {
  const router = useRouter();
  const currentUser = getStoredUser();
  const [loadingRole, setLoadingRole] = useState<"admin" | "user" | null>(null);

  async function handleQuickLogin(role: "admin" | "user") {
    setLoadingRole(role);
    try {
      await loginAsPreset(role);
      router.push("/onboarding");
    } finally {
      setLoadingRole(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between px-6 py-8 relative overflow-hidden font-sans select-none">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between z-10 font-mono text-xs">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <span className="text-cyan-400 font-bold">←</span>
          <span>Return to Overview</span>
        </Link>

        <Link
          href="/3d"
          className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
        >
          <span>Skip straight to 3D Sim</span>
          <span>→</span>
        </Link>
      </div>

      {/* Center Account Selection Card */}
      <div className="w-full max-w-xl mx-auto my-8 z-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 sm:p-10 shadow-2xl relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-white font-bold tracking-widest uppercase">Select Account</span>
            </div>
            <span className="text-[11px] font-mono text-white/40 uppercase">1-Click Access</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
            Choose your station profile.
          </h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            No signup passwords or email verification needed. Tap an account below to jump right into the expedition workspace.
          </p>

          {/* Current user banner if already logged in */}
          {currentUser && (
            <div className="mt-6 p-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400">Currently active: </span>
                <strong className="text-white font-medium">{currentUser.name}</strong>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-cyan-400/20 text-cyan-300">
                  {currentUser.role || "user"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearAuth();
                  router.refresh();
                }}
                className="text-xs text-slate-400 hover:text-white underline font-mono"
              >
                Sign out
              </button>
            </div>
          )}

          {/* 2 Account Choice Cards */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Account 1: Admin */}
            <button
              type="button"
              disabled={loadingRole !== null}
              onClick={() => handleQuickLogin("admin")}
              className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] hover:bg-amber-500/[0.08] hover:border-amber-400/60 transition-all text-left flex flex-col justify-between group cursor-pointer disabled:opacity-50"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">🛡️</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    Admin
                  </span>
                </div>
                <h2 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors">
                  Station Admin
                </h2>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  admin@thermoshelter.com
                </div>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Full command access · Station calibration, thermal parameters, and system exports.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-amber-300 group-hover:translate-x-1 transition-transform">
                <span>{loadingRole === "admin" ? "Signing In..." : "Enter as Admin"}</span>
                <span>→</span>
              </div>
            </button>

            {/* Account 2: User */}
            <button
              type="button"
              disabled={loadingRole !== null}
              onClick={() => handleQuickLogin("user")}
              className="p-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.04] hover:bg-cyan-500/[0.08] hover:border-cyan-400/60 transition-all text-left flex flex-col justify-between group cursor-pointer disabled:opacity-50"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">🔬</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    User
                  </span>
                </div>
                <h2 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  Field Researcher
                </h2>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  user@thermoshelter.com
                </div>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Standard architect access · GPS site mapping, terrain photo attachments, and 3D simulation.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-cyan-300 group-hover:translate-x-1 transition-transform">
                <span>{loadingRole === "user" ? "Signing In..." : "Enter as User"}</span>
                <span>→</span>
              </div>
            </button>
          </div>

          {/* Skip link */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <Link
              href="/3d"
              className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1 font-mono"
            >
              <span>Or test the 3D thermal simulator without an account</span>
              <span className="text-cyan-400">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 z-10">
        <div>Thermo Shelter 1 · 2 Pre-configured Station Profiles</div>
        <div className="flex gap-4">
          <Link href="/simulate" className="hover:text-slate-300 transition">
            Regional Sim
          </Link>
          <span>·</span>
          <Link href="/3d" className="hover:text-slate-300 transition">
            3D Studio
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-white font-mono text-sm">
          Loading station accounts...
        </div>
      }
    >
      <AccountSelect />
    </Suspense>
  );
}
