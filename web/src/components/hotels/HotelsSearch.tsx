"use client";

import { useState } from "react";
import { buildBookingUrl } from "@/lib/affiliate-links";
import { waLink } from "@/lib/whatsapp";

const POPULAR_DESTINATIONS = [
  "Accra, Ghana",
  "Kumasi, Ghana",
  "Takoradi, Ghana",
  "Tamale, Ghana",
  "Cape Coast, Ghana",
  "Dubai, UAE",
  "London, UK",
  "Abidjan, Ivory Coast",
  "Lagos, Nigeria",
  "Nairobi, Kenya",
];

const today = () => new Date().toISOString().split("T")[0];
const addDays = (base: string, n: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};

const helpWa = waLink(
  "Hi AutoSell Ghana! I need help finding a hotel or accommodation. Can you assist?",
);

export function HotelsSearch() {
  const t = today();
  const [destination, setDestination] = useState("");
  const [checkin, setCheckin] = useState(addDays(t, 3));
  const [checkout, setCheckout] = useState(addDays(t, 6));
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!destination.trim()) {
      setError("Please enter a destination.");
      return;
    }
    if (checkin >= checkout) {
      setError("Check-out must be after check-in.");
      return;
    }
    const url = buildBookingUrl({ destination: destination.trim(), checkin, checkout, guests });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Destination */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#1a1f2e]">
            Destination <span className="text-[#E8500A]">*</span>
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="City, region, or hotel name"
            list="hotel-destinations"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[#1a1f2e] placeholder:text-[#9ca3af] focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
          />
          <datalist id="hotel-destinations">
            {POPULAR_DESTINATIONS.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#1a1f2e]">Check-in</label>
            <input
              type="date"
              value={checkin}
              min={today()}
              onChange={(e) => {
                setCheckin(e.target.value);
                if (e.target.value >= checkout) {
                  setCheckout(addDays(e.target.value, 3));
                }
              }}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[#1a1f2e] focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#1a1f2e]">Check-out</label>
            <input
              type="date"
              value={checkout}
              min={addDays(checkin, 1)}
              onChange={(e) => setCheckout(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[#1a1f2e] focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
            />
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#1a1f2e]">Guests</label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[#1a1f2e] focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90"
        >
          Search Hotels
        </button>

        <p className="text-center text-xs text-[#9ca3af]">
          Search results open on{" "}
          <span className="font-semibold text-[#7c3aed]">Booking.com</span> — you book directly
          with the property.
        </p>
      </form>

      {/* Popular in Ghana */}
      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">
          Popular in Ghana
        </p>
        <div className="flex flex-wrap gap-2">
          {["Accra", "Kumasi", "Cape Coast", "Takoradi", "Tamale"].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setDestination(`${city}, Ghana`)}
              className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[#4b5563] transition-colors hover:border-[#7c3aed] hover:text-[#7c3aed]"
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp help */}
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[#f9fafb] p-5 text-center">
        <p className="mb-3 text-sm text-[#4b5563]">
          Need accommodation recommendations? We can help on WhatsApp.
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
