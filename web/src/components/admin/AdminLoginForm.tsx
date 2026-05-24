"use client";

import { useState } from "react";
import Link from "next/link";

export function AdminLoginForm({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "Login failed");
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-[var(--color-secondary)]">Admin login</h1>
        {configured ? (
          <p className="mt-2 text-center text-sm text-neutral-600">Sign in</p>
        ) : (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-900">
            Admin sign-in is not configured on this server yet. If you own this site, add{" "}
            <code className="rounded bg-amber-100/80 px-1">ADMIN_PASSWORD</code> and{" "}
            <code className="rounded bg-amber-100/80 px-1">ADMIN_JWT_SECRET</code> to your hosting
            environment, then redeploy.
          </p>
        )}
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
              required
              disabled={!configured}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !configured}
            className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <Link href="/" className="mt-6 block text-center text-sm text-neutral-500 hover:text-[var(--color-primary)]">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
