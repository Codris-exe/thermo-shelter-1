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
      setError("Please enter your name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
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
              : { name, email, password },
          ),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed.");
      }

      saveAuth(data.access_token, data.user);
      router.push("/onboarding");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Authentication failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-xl">
          <Link href="/" className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            Thermo Shelter 1
          </Link>

          <h1 className="mt-6 text-3xl font-semibold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Sign in before choosing the land location or uploading a site image.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "register" && (
              <label className="block">
                <span className="mb-2 block text-xs text-slate-400">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-xs text-slate-400">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs text-slate-400">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
                placeholder="Minimum 8 characters"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </label>

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 px-4 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            className="mt-5 w-full text-sm text-slate-400 hover:text-white"
          >
            {mode === "login"
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070b14] flex items-center justify-center text-white font-mono text-sm">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
