"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur">
        {/* Glow */}
        <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-transparent to-sky-500/20 blur-3xl" />

        <div className="relative space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/40">
              <span className="text-sm font-semibold text-emerald-300">L</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              Sign in to LendFlow
            </h1>
            <p className="text-xs text-slate-400">
              Continue your loan journey
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Email or phone number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />

            <button
              type="submit"
              className="w-full rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-300"
            >
              Sign in
            </button>
          </form>

          {/* Footer */}
          <div className="flex justify-between text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-200">
              ← Back to home
            </Link>
            <Link
              href="/signup"
              className="text-emerald-300 hover:text-emerald-200"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
