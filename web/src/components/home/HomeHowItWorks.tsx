"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { waLink } from "@/lib/whatsapp";

const STEP_MS = 4000;

const STEPS = [
  {
    n: "1",
    icon: "🔍",
    title: "Browse verified cars",
    desc: "Search by make, price, and location — every listing is reviewed before it goes live.",
    cta: { label: "Start browsing", href: "/cars" },
  },
  {
    n: "2",
    icon: "💬",
    title: "WhatsApp through AutoSell",
    desc: "Enquire directly on WhatsApp — we connect you with the seller and help arrange viewing.",
    cta: { label: "Chat with us", href: null }, // null → WhatsApp link
  },
  {
    n: "3",
    icon: "🚗",
    title: "Pay & drive away",
    desc: "Agree the price, complete the paperwork, and drive your new car home.",
    cta: { label: "See featured deals", href: "/#browse" },
  },
];

export function HomeHowItWorks() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Only auto-advance while the section is on screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const running = inView && !paused;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, running]);

  return (
    <section
      ref={sectionRef}
      className="border-y border-[var(--border)] bg-white px-5 py-14 md:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <div className="section-label justify-center">How it works</div>
          <h2 className="font-display text-2xl font-bold text-[#1A1F2E] md:text-3xl">
            Three steps to your next car
          </h2>
        </div>

        <div className="relative grid gap-4 sm:grid-cols-3 sm:gap-6">
          {/* Connector line (desktop) — fills as steps activate */}
          <div
            className="absolute left-[16.66%] right-[16.66%] top-12 hidden h-0.5 overflow-hidden rounded-full bg-[#F0E4DD] sm:block"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--orange)] to-[#FF7A3D] transition-all duration-700 ease-out"
              style={{ width: `${(active / (STEPS.length - 1)) * 100}%` }}
            />
          </div>

          {STEPS.map((s, i) => {
            const isActive = i === active;
            const isDone = i < active;
            return (
              <button
                key={s.n}
                type="button"
                onClick={() => setActive(i)}
                aria-current={isActive ? "step" : undefined}
                className={`group relative flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all duration-300 sm:items-center sm:pt-7 sm:text-center ${
                  isActive
                    ? "-translate-y-1 border-[var(--orange)]/35 bg-[#FFF9F6] shadow-[0_14px_32px_rgba(232,80,10,0.12)]"
                    : "border-transparent hover:border-[var(--border)] hover:bg-[#FAFBFC]"
                }`}
              >
                <div
                  className={`relative z-[1] flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl transition-all duration-300 ${
                    isActive
                      ? "scale-110 bg-[var(--orange)] shadow-lg ring-4 ring-[var(--orange)]/15"
                      : isDone
                        ? "bg-[var(--orange)]/85"
                        : "bg-[#fff0eb] group-hover:scale-105"
                  }`}
                >
                  {s.icon}
                  <span
                    className={`font-display absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ring-2 ring-white transition-colors duration-300 ${
                      isActive || isDone
                        ? "bg-[#1A1F2E] text-white"
                        : "bg-[var(--orange)] text-white"
                    }`}
                  >
                    {isDone ? "✓" : s.n}
                  </span>
                </div>

                <div>
                  <p
                    className={`font-display text-sm font-bold transition-colors duration-300 md:text-base ${
                      isActive ? "text-[var(--orange)]" : "text-[#1A1F2E]"
                    }`}
                  >
                    {s.title}
                  </p>
                  <p className="mt-1 text-sm text-[#6B7280]">{s.desc}</p>
                </div>

                {/* Contextual CTA — always visible on mobile (no layout shift); revealed on active step from sm: up */}
                <div
                  className={`overflow-hidden transition-all duration-300 sm:mx-auto ${
                    isActive
                      ? "max-h-10 opacity-100"
                      : "max-h-10 opacity-100 sm:max-h-0 sm:opacity-0"
                  }`}
                >
                  {s.cta.href ? (
                    <Link
                      href={s.cta.href}
                      className="font-display inline-flex items-center gap-1 text-sm font-semibold text-[var(--orange)] hover:underline"
                    >
                      {s.cta.label} <span aria-hidden>→</span>
                    </Link>
                  ) : (
                    <a
                      href={waLink("Hi AutoSell Ghana! I'm interested in buying a car.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display inline-flex items-center gap-1 text-sm font-semibold text-[var(--orange)] hover:underline"
                    >
                      {s.cta.label} <span aria-hidden>→</span>
                    </a>
                  )}
                </div>

                {/* Auto-advance timer bar on the active card */}
                {isActive && (
                  <div className="absolute inset-x-5 bottom-2 h-0.5 overflow-hidden rounded-full bg-[var(--orange)]/10" aria-hidden>
                    <div
                      key={active}
                      className="hero-progress h-full rounded-full bg-[var(--orange)]/60"
                      style={
                        {
                          "--duration": `${STEP_MS}ms`,
                          animationPlayState: running ? "running" : "paused",
                        } as React.CSSProperties
                      }
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
