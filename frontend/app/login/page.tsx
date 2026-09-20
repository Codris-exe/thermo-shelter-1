"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAsPreset, getStoredUser, clearAuth } from "@/lib/auth";

function AccountSelect() {
  const router = useRouter();
  const currentUser = getStoredUser();
  const [loadingRole, setLoadingRole] = useState<"admin" | "user" | null>(null);

  async function handleLogin(role: "admin" | "user") {
    setLoadingRole(role);
    try {
      await loginAsPreset(role);
      router.push("/onboarding");
    } finally {
      setLoadingRole(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between px-6 py-10 font-sans">
      {/* Top Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between text-xs font-mono">
        <Link href="/" className="text-slate-400 hover:text-white transition">
          ← Back to Home
        </Link>
        <Link href="/3d" className="text-cyan-400 hover:text-cyan-300 transition">
          Skip to 3D Simulator →
        </Link>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="rounded-2xl border border-white/10 bg-[#0d1322] p-8 shadow-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white tracking-tight">Sign In</h1>
            <p className="mt-1 text-sm text-slate-400">
              Select an account to continue.
            </p>
          </div>

          {currentUser && (
            <div className="mb-6 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400">Signed in as: </span>
                <strong className="text-white">{currentUser.name}</strong>{" "}
                <span className="text-slate-400 font-mono">({currentUser.role})</span>
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

          <div className="space-y-3">
            {/* Admin Account */}
            <button
              type="button"
              disabled={loadingRole !== null}
              onClick={() => handleLogin("admin")}
              className="w-full p-4 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/30 transition text-left flex items-center justify-between group disabled:opacity-50"
            >
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition">
                  Admin
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  admin@thermoshelter.com
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 group-hover:text-white transition">
                {loadingRole === "admin" ? "Signing in..." : "Continue →"}
              </span>
            </button>

            {/* User Account */}
            <button
              type="button"
              disabled={loadingRole !== null}
              onClick={() => handleLogin("user")}
              className="w-full p-4 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/30 transition text-left flex items-center justify-between group disabled:opacity-50"
            >
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition">
                  User
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  user@thermoshelter.com
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 group-hover:text-white transition">
                {loadingRole === "user" ? "Signing in..." : "Continue →"}
              </span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <Link
              href="/3d"
              className="text-xs text-slate-400 hover:text-white transition font-mono"
            >
              Continue without signing in →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-slate-600 font-mono">
        Thermo Shelter · Alpine Thermal Modeling
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-white font-mono text-sm">
          Loading...
        </div>
      }
    >
      <AccountSelect />
    </Suspense>
  );
}
