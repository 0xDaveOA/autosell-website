import type { Metadata } from "next";
import { HotelsSearch } from "@/components/hotels/HotelsSearch";

export const metadata: Metadata = {
  title: "Find Hotels & Stays in Ghana | AutoSell Ghana",
  description:
    "Search hotels, guesthouses, and accommodation across Ghana and Africa. Book directly via Booking.com.",
};

export default function HotelsPage() {
  return (
    <main className="min-h-screen bg-[#F4F6F8]">
      {/* Header banner */}
      <div className="bg-[#7c3aed] px-5 py-16 text-center md:px-8 md:py-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} className="h-9 w-9">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Find Hotels &amp; Stays
          </h1>
          <p className="mt-3 text-purple-100">
            Hotels, guesthouses, and short-term stays across Ghana and beyond.
          </p>
        </div>
      </div>

      {/* Search card */}
      <div className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <HotelsSearch />
        </div>

        {/* Info strip */}
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { emoji: "🏨", label: "Hotels & stays", sub: "via Booking.com" },
              { emoji: "🇬🇭", label: "Ghana & beyond", sub: "African & global" },
              { emoji: "🔒", label: "Secure booking", sub: "on Booking.com" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <div className="text-2xl">{s.emoji}</div>
                <p className="mt-1 text-sm font-semibold text-[#1a1f2e]">{s.label}</p>
                <p className="text-xs text-[#9ca3af]">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
