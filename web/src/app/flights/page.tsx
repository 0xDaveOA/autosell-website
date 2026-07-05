import type { Metadata } from "next";
import { FlightsSearch } from "@/components/flights/FlightsSearch";

export const metadata: Metadata = {
  title: "Find Flights from Ghana | AutoSell Ghana",
  description:
    "Search flights from Accra and other Ghanaian airports to destinations worldwide. Powered by Skyscanner.",
};

export default function FlightsPage() {
  return (
    <main className="min-h-screen bg-[#F4F6F8]">
      {/* Header banner */}
      <div className="bg-[#2563eb] px-5 py-16 text-center md:px-8 md:py-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} className="h-9 w-9">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Find Flights from Ghana
          </h1>
          <p className="mt-3 text-blue-100">
            Search flights from Accra and other Ghanaian airports to anywhere in the world.
          </p>
        </div>
      </div>

      {/* Search card */}
      <div className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <FlightsSearch />
        </div>

        {/* Info strip */}
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { emoji: "✈️", label: "Live prices", sub: "via Skyscanner" },
              { emoji: "🌍", label: "Worldwide", sub: "destinations" },
              { emoji: "💰", label: "Best deals", sub: "across airlines" },
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
