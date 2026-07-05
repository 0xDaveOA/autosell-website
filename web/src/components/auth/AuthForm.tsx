"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

type Tab = "google" | "email";

const inputClass =
  "w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-[#1A1F2E] placeholder-[#9CA3AF] outline-none focus:border-[#E8500A] focus:ring-2 focus:ring-[#E8500A]/20 transition-all";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const [tab, setTab] = useState<Tab>("google");

  // Email state
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const supabase = createBrowserSupabase();

  function reset() {
    setEmail("");
    setEmailSent(false);
    setMsg(null);
  }

  async function signInWithGoogle() {
    if (!supabase) return;
    setLoading(true);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) {
      setLoading(false);
      setMsg({ ok: false, text: error.message });
    }
    // On success browser redirects to Google — no further action needed
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setMsg(null);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    setLoading(false);
    if (error) {
      setMsg({ ok: false, text: error.message });
    } else {
      setEmailSent(true);
      setMsg({ ok: true, text: "Magic link sent! Check your email." });
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "google", label: "Google" },
    { id: "email", label: "Email" },
  ];

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#E2E6EA] bg-white p-8 shadow-lg">
      <h1 className="font-display mb-1 text-2xl font-bold text-[#1A1F2E]">Sign in to AutoSell</h1>
      <p className="mb-6 text-sm text-[#6B7280]">Same account for buying, selling, and renting.</p>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-[#F4F6F8] p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); reset(); }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-white text-[#E8500A] shadow-sm"
                : "text-[#6B7280] hover:text-[#1A1F2E]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Google */}
      {tab === "google" && (
        <div className="space-y-4">
          <p className="text-sm text-[#6B7280]">Sign in with your Google account — fast and secure.</p>
          <button
            type="button"
            disabled={loading}
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-[#E2E6EA] bg-white py-3 text-sm font-semibold text-[#374151] transition-all hover:border-[#E8500A] hover:text-[#E8500A] disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {loading ? "Redirecting…" : "Continue with Google"}
          </button>
        </div>
      )}

      {/* Email magic link */}
      {tab === "email" && (
        <div>
          {!emailSent ? (
            <form onSubmit={sendMagicLink} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#374151]">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary w-full rounded-lg py-3 text-sm font-semibold disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send magic link"}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="text-5xl">📧</div>
              <p className="font-semibold text-[#1A1F2E]">Check your inbox!</p>
              <p className="text-sm text-[#6B7280]">
                We sent a sign-in link to <span className="font-semibold">{email}</span>. Click it to log in.
              </p>
              <button
                type="button"
                onClick={() => { setEmailSent(false); setEmail(""); setMsg(null); }}
                className="text-sm text-[#6B7280] underline"
              >
                Try a different email
              </button>
            </div>
          )}
        </div>
      )}

      {/* Status message */}
      {msg && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
            msg.ok ? "bg-[#E8F6F1] text-[#00875a]" : "bg-[#FEE2E2] text-[#DC2626]"
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
