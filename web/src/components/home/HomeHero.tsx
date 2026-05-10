"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const slides = [
  {
    image: "/photo_2025-02-22_10-14-40.jpg",
    headline: "Find Your Perfect\nCar in Ghana",
    sub: "Browse verified listings from trusted sellers across Accra, Kumasi and beyond.",
  },
  {
    image: "/Car Ads/3.webp",
    headline: "Sell Your Car\nQuickly & Easily",
    sub: "List in minutes, get WhatsApp enquiries from serious buyers across Ghana.",
  },
  {
    image: "/photo_2025-02-22_10-14-40.jpg",
    headline: "Ghana's Most\nTrusted Car Market",
    sub: "Verified sellers, real prices, and local support — buying made simple.",
  },
];

const MAKES = [
  "Toyota",
  "Honda",
  "Hyundai",
  "Mercedes-Benz",
  "BMW",
  "Ford",
  "Kia",
  "Nissan",
  "Volkswagen",
  "Lexus",
  "Mitsubishi",
  "Acura",
  "Suzuki",
];

const LOCATIONS = ["Accra", "Kumasi", "Tema", "Takoradi", "Tamale", "Cape Coast", "Sunyani", "Koforidua"];

const PRICES = [
  { label: "Any price", value: "" },
  { label: "Under ₵50,000", value: "0-50000" },
  { label: "₵50,000 – ₵100,000", value: "50000-100000" },
  { label: "₵100,000 – ₵200,000", value: "100000-200000" },
  { label: "₵200,000 – ₵500,000", value: "200000-500000" },
  { label: "Above ₵500,000", value: "500000-" },
];

const DURATION = 5500;

export function HomeHero() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [tick, setTick] = useState(0);

  const goTo = useCallback((i: number) => {
    setCurrent(i);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
      setTick((k) => k + 1);
    }, DURATION);
    return () => window.clearInterval(t);
  }, []);

  const search = () => {
    const makeEl = document.getElementById("hero-make") as HTMLSelectElement | null;
    const locEl = document.getElementById("hero-location") as HTMLSelectElement | null;
    const priceEl = document.getElementById("hero-price") as HTMLSelectElement | null;
    const make = makeEl?.value ?? "";
    const location = locEl?.value ?? "";
    const price = priceEl?.value ?? "";
    const p = new URLSearchParams();
    if (make) p.set("make", make);
    if (location) p.set("location", location);
    if (price) p.set("price", price);
    router.push(`/cars?${p.toString()}`);
  };

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden" style={{ minHeight: 580 }}>
      {slides.map((s, i) => (
        <div
          key={s.image + i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0, zIndex: 0 }}
        >
          <Image
            src={s.image}
            alt=""
            fill
            className="object-cover transition-transform duration-[7000ms] ease-out"
            style={{ transform: i === current ? "scale(1.03)" : "scale(1)" }}
            sizes="100vw"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/70" />
        </div>
      ))}

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-14 md:px-8 md:pb-14 md:pt-20">
        <div key={tick} className="mb-10 text-center">
          <h1 className="anim-fade-up font-display text-3xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-6xl">
            {slide.headline.split("\n").map((line, idx) => (
              <span key={line} className="block">
                {idx === 1 ? <span className="text-[#FF7A3D]">{line}</span> : line}
              </span>
            ))}
          </h1>
          <p className="anim-fade-up-1 mx-auto max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            {slide.sub}
          </p>
        </div>

        <div className="anim-fade-up-2 search-card mx-auto max-w-3xl p-2">
          <div className="mb-3 flex border-b border-[#E2E6EA] px-2">
            {["Buy a car", "Sell my car"].map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => i === 1 && router.push("/sell")}
                className={`font-display -mb-px border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                  i === 0
                    ? "border-[#E8500A] text-[#E8500A]"
                    : "border-transparent text-[#6B7280] hover:text-[#1A1F2E]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 p-2 sm:flex-row">
            <div className="search-input flex flex-1 items-center gap-3 rounded-lg border border-[#E2E6EA] px-3 py-2.5 transition-all focus-within:border-[#E8500A] focus-within:ring-2 focus-within:ring-[#E8500A]/10">
              <svg
                className="h-4 w-4 shrink-0 text-[#9CA3AF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 0m5 0h3m5 0h2v-4l-3-4H3m13 4V8"
                />
              </svg>
              <select
                id="hero-make"
                className="flex-1 cursor-pointer appearance-none bg-transparent text-sm text-[#1A1F2E] outline-none"
                defaultValue=""
              >
                <option value="">Any make</option>
                {MAKES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-input flex flex-1 items-center gap-3 rounded-lg border border-[#E2E6EA] px-3 py-2.5 transition-all focus-within:border-[#E8500A] focus-within:ring-2 focus-within:ring-[#E8500A]/10">
              <svg
                className="h-4 w-4 shrink-0 text-[#9CA3AF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <select
                id="hero-location"
                className="flex-1 cursor-pointer appearance-none bg-transparent text-sm text-[#1A1F2E] outline-none"
                defaultValue=""
              >
                <option value="">Any location</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-input flex flex-1 items-center gap-3 rounded-lg border border-[#E2E6EA] px-3 py-2.5 transition-all focus-within:border-[#E8500A] focus-within:ring-2 focus-within:ring-[#E8500A]/10">
              <svg
                className="h-4 w-4 shrink-0 text-[#9CA3AF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <select
                id="hero-price"
                className="flex-1 cursor-pointer appearance-none bg-transparent text-sm text-[#1A1F2E] outline-none"
                defaultValue=""
              >
                {PRICES.map((p) => (
                  <option key={p.value || "any"} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={search}
              className="btn-primary flex shrink-0 items-center justify-center gap-2 whitespace-nowrap px-6 py-2.5 text-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </div>

        <div className="anim-fade-up-3 mt-8 flex flex-wrap justify-center gap-3">
          {[
            { n: "50+", l: "Cars listed" },
            { n: "100+", l: "Happy buyers" },
            { n: "15+", l: "Cities covered" },
            { n: "Free", l: "To list your car" },
          ].map((s) => (
            <div key={s.l} className="stat-pill text-center">
              <div className="font-display text-lg font-bold leading-tight text-white">{s.n}</div>
              <div className="mt-0.5 text-xs text-white/60">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex justify-center gap-2 pb-5">
        {slides.map((_, i) => (
          <button
            key={`hero-slide-${i}`}
            type="button"
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "h-1.5 w-7 bg-[#E8500A]" : "h-1.5 w-1.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 h-0.5 bg-white/10">
        <div
          key={`p-${tick}`}
          className="hero-progress h-full bg-[#E8500A]"
          style={{ "--duration": `${DURATION}ms` } as React.CSSProperties}
        />
      </div>
    </section>
  );
}
