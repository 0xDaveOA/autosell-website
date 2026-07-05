"use client";

import { useState } from "react";
import { buildSkyscannerUrl } from "@/lib/affiliate-links";
import { waLink } from "@/lib/whatsapp";

const GHANA_AIRPORTS = [
  { code: "ACC", label: "Accra — Kotoka International (ACC)" },
  { code: "KMS", label: "Kumasi — Kumasi Airport (KMS)" },
  { code: "TML", label: "Tamale — Tamale Airport (TML)" },
  { code: "TKD", label: "Takoradi — Takoradi Airport (TKD)" },
];

const today = () => new Date().toISOString().split("T")[0];
const addDays = (base: string, n: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};

const helpWa = waLink(
  "Hi AutoSell Ghana! I need help booking a flight. Can you assist?",
);

export function FlightsSearch() {
  const t = today();
  const [from, setFrom] = useState("ACC");
  const [to, setTo] = useState("");
  const [outDate, setOutDate] = useState(addDays(t, 3));
  const [inDate, setInDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [tripType, setTripType] = useState<"one-way" | "return">("one-way");
  const [error, setError] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!to.trim()) {
      setError("Please enter a destination.");
      return;
    }
    if (tripType === "return" && !inDate) {
      setError("Please enter a return date.");
      return;
    }
    const url = buildSkyscannerUrl({
      from,
      to: to.trim().toUpperCase(),
      outDate,
      inDate: tripType === "return" ? inDate : undefined,
      passengers,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Trip type toggle */}
      <div className="mb-6 flex gap-2">
        {(["one-way", "return"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTripType(t)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tripType === t
                ? "bg-[#2563eb] text-white"
                : "border border-[var(--border)] bg-white text-[#4b5563] hover:bg-[#eff6ff]"
            }`}
          >
            {t === "one-way" ? "One Way" : "Return"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* From */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#1a1f2e]">From</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[#1a1f2e] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
          >
            {GHANA_AIRPORTS.map((a) => (
              <option key={a.code} value={a.code}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        {/* To */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#1a1f2e]">
            To <span className="text-[#E8500A]">*</span>
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="e.g. London, Dubai, New York or IATA code (LHR)"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[#1a1f2e] placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
          />
        </div>

        {/* Dates */}
        <div className={`grid gap-4 ${tripType === "return" ? "sm:grid-cols-2" : ""}`}>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#1a1f2e]">Departure</label>
            <input
              type="date"
              value={outDate}
              min={today()}
              onChange={(e) => setOutDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[#1a1f2e] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>
          {tripType === "return" && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#1a1f2e]">
                Return <span className="text-[#E8500A]">*</span>
              </label>
              <input
                type="date"
                value={inDate}
                min={outDate || today()}
                onChange={(e) => setInDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[#1a1f2e] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              />
            </div>
          )}
        </div>

        {/* Passengers */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#1a1f2e]">Passengers</label>
          <select
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[#1a1f2e] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "Adult" : "Adults"}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-xl bg-[#2563eb] px-6 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90"
        >
          Search Flights
        </button>

        <p className="text-center text-xs text-[#9ca3af]">
          Search results open on{" "}
          <span className="font-semibold text-[#2563eb]">Skyscanner</span> — you book directly with
          the airline.
        </p>
      </form>

      {/* WhatsApp help */}
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[#f9fafb] p-5 text-center">
        <p className="mb-3 text-sm text-[#4b5563]">
          Need help planning your trip? Chat with us on WhatsApp.
        </p>
        <a
          href={helpWa}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp font-display inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
          WhatsApp AutoSell Ghana
        </a>
      </div>
    </div>
  );
}
