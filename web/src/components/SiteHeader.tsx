"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND_LOGO_SRC } from "@/lib/brand";
import { waLink } from "@/lib/whatsapp";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { label: "Buy a car", href: "/cars" },
  { label: "Rent a car", href: "/rentals" },
  { label: "Flights", href: "/flights" },
  { label: "Hotels", href: "/hotels" },
  { label: "Sell my car", href: "/sell" },
  { label: "Partner with us", href: "/#partner" },
];

export function SiteHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createBrowserSupabase();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const initials = user
    ? ((user.user_metadata?.full_name ?? user.email ?? user.phone ?? "U") as string)
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <>
      <div className="hidden bg-[#E8500A] px-4 py-2 text-center text-xs font-medium text-white md:block">
        🇬🇭 Ghana&apos;s fastest growing car marketplace — List your car FREE today
      </div>

      <header
        className={`sticky top-0 z-40 bg-[#1A1F2E] transition-shadow duration-300 ${scrolled ? "shadow-lg" : ""}`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 shrink-0 items-center rounded-lg bg-white px-1.5 py-1 ring-1 ring-white/20 transition-opacity group-hover:opacity-95 md:h-10">
              <Image
                src={BRAND_LOGO_SRC}
                alt="AutoSell Ghana"
                width={160}
                height={56}
                sizes="(max-width:768px) 120px, 140px"
                className="h-full w-auto max-h-full max-w-[118px] object-contain object-center md:max-w-[140px]"
                priority
              />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Auto<span className="text-[#E8500A]">Sell</span>
              <span className="ml-1 hidden text-sm font-normal text-[#9CA3AF] sm:inline">Ghana</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#D1D5DB] transition-all hover:bg-white/8 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href={waLink("Hi AutoSell Ghana!")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-[#D1D5DB] transition-all hover:border-white/40 hover:text-white"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8500A] text-[10px] font-bold text-white">
                    {initials}
                  </span>
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#9CA3AF] transition-colors hover:text-white"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link href="/login" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-[#D1D5DB] transition-all hover:border-white/40 hover:text-white">
                Sign in
              </Link>
            )}
            <Link href="/sell" className="btn-primary rounded-lg px-5 py-2 text-sm">
              List a Car
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative z-50 flex flex-col gap-1.5 p-2 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span
              className={`block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </header>

      <div className={`mobile-menu md:hidden ${menuOpen ? "open" : ""}`}>
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setMenuOpen(false)}
            className="font-display text-2xl font-semibold text-white transition-colors hover:text-[#E8500A]"
          >
            {l.label}
          </Link>
        ))}
        <div className="mt-4 flex w-44 flex-col gap-3">
          <a
            href={waLink("Hi AutoSell Ghana!")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="btn-whatsapp flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm"
          >
            WhatsApp Us
          </a>
          <Link
            href="/sell"
            onClick={() => setMenuOpen(false)}
            className="btn-primary flex items-center justify-center rounded-xl px-5 py-3 text-sm"
          >
            List a Car
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); handleSignOut(); }}
                className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-[#9CA3AF]"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
