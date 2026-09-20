"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { saveAuth, isAuthenticated } from "@/lib/auth";

const API_BASE = "/backend-api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedMode = searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<"login" | "register">(requestedMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qMode = searchParams.get("mode");
    if (qMode === "register" || qMode === "login") {
      setMode(qMode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated()) router.replace("/onboarding");
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (mode === "register" && name.trim().length < 2) {
      setError("Please let us know your name or team callsign.");
      return;
    }

    if (password.length < 8) {
      setError("Password needs at least 8 characters to keep your designs secure.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/auth/${mode === "login" ? "login" : "register"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "login"
              ? { email, password }
              : { name: name.trim(), email: email.trim().toLowerCase(), password },
          ),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Unable to sign in. Please check your details and try again.");
      }

      saveAuth(data.access_token, data.user);
      router.push("/onboarding");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong during sign-in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between px-6 py-8 relative overflow-hidden font-sans select-none">
      {/* Background ambient radial gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between z-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xs tracking-widest uppercase font-mono text-slate-400 hover:text-white transition-colors"
        >
          <span className="text-cyan-400 font-bold">←</span>
          <span>Return to Overview</span>
        </Link>

        <Link
          href="/3d"
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
        >
          <span>Try 3D Simulator as Guest</span>
          <span>→</span>
        </Link>
      </div>

      {/* Center Form Card */}
      <div className="w-full max-w-lg mx-auto my-8 z-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 sm:p-10 shadow-2xl relative">
          {/* Brand header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-white font-bold tracking-widest uppercase">TS-1 AUTHENTICATION</span>
            </div>
            <span className="text-[11px] font-mono text-white/40 uppercase">Alpine Station</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/[0.04] border border-white/10 mb-8 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`py-2.5 rounded-xl font-semibold transition-all ${
                mode === "login"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`py-2.5 rounded-xl font-semibold transition-all ${
                mode === "register"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Welcoming Context */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
              {mode === "login" ? "Welcome back, Architect." : "Join the Alpine Habitat Project."}
            </h1>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              {mode === "login"
                ? "Sign in to access your saved Ladakh coordinates, site terrain photos, and customized shelter thermal balance models."
                : "Create your architect profile to pin mountain building sites on OpenStreetMap, upload site photos, and test passive zero-fuel heating."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4 font-sans">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Your Full Name or Callsign
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tenzin Norbu · Leh Field Station"
                    autoComplete="name"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#070b14]/80 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Work or Field Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@himalayas.org"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-white/10 bg-[#070b14]/80 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <span className="text-[11px] font-mono text-slate-500">8+ chars minimum</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#070b14]/80 px-4 py-3 pr-12 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3.5 text-xs text-red-200 leading-relaxed flex items-start gap-2.5">
                <span className="text-red-400 text-sm">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3.5 text-xs uppercase tracking-widest transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading
                ? "Connecting to Station..."
                : mode === "login"
                  ? "Sign In to Workspace →"
                  : "Create Account & Begin Site Setup →"}
            </button>
          </form>

          {/* Quick toggle link */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
            {mode === "login" ? (
              <p>
                First time here?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
                >
                  Create your workspace account
                </button>
              </p>
            ) : (
              <p>
                Already have a station profile?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Guest fallback banner */}
        <div className="mt-6 text-center">
          <Link
            href="/3d"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition"
          >
            <span>Skip authentication and test simulator directly</span>
            <span className="text-cyan-400">→</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 z-10">
        <div>Thermo Shelter 1 · Himalayan Extreme Cold Passive Architecture</div>
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
          Loading station credentials...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
