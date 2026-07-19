import Link from "next/link";
import { fetchActiveRentalListings } from "@/lib/rental-listings";
import { RentalListingCard } from "@/components/RentalListingCard";

export async function HomeRentalsShowcase() {
  const rentals = await fetchActiveRentalListings({}, { limit: 4 });

  return (
    <section className="bg-white px-5 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2.5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#00875a]">
              <span className="inline-block h-0.5 w-6 rounded-full bg-[#00875a]" aria-hidden />
              Rentals & leasing
            </div>
            <h2 className="font-display text-2xl font-bold text-[#1A1F2E] md:text-3xl">Rent a Car in Ghana</h2>
            <p className="mt-2 max-w-xl text-[#6B7280]">
              Daily rentals and long-term leases from trusted partners — with or without a driver.
            </p>
          </div>
          <Link
            href="/rentals"
            className="font-display hidden shrink-0 items-center gap-1.5 rounded-lg bg-[#00875a] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:flex"
          >
            View all rentals
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {rentals.length === 0 ? (
          <div className="grid gap-6 rounded-2xl bg-gradient-to-br from-[#00875a] to-[#006644] p-8 text-white md:grid-cols-2 md:items-center md:p-10">
            <div>
              <h3 className="font-display text-xl font-bold md:text-2xl">Run a car rental business?</h3>
              <p className="mt-2 text-white/85">
                List your fleet on AutoSell for free and reach customers across Ghana. Daily rentals, long-term
                leases, with or without a driver — you set the rates.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/rent-with-us"
                className="font-display inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#00875a] transition-transform hover:scale-[1.02]"
              >
                List your fleet — free →
              </Link>
              <Link
                href="/rentals"
                className="font-display inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                Browse rentals
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {rentals.map((rental) => (
              <RentalListingCard key={rental.id} rental={rental} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/rentals"
            className="font-display inline-flex items-center gap-2 rounded-lg bg-[#00875a] px-8 py-3.5 text-sm font-semibold text-white"
          >
            Browse all rentals
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
