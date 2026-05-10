import Link from "next/link";
import { fetchPublishedListings } from "@/lib/listings";
import { CarListingCard } from "@/components/CarListingCard";

export async function HomeFeatured() {
  const cars = await fetchPublishedListings({}, { limit: 6 });

  return (
    <section id="browse" className="scroll-mt-24 bg-[#F4F6F8] px-5 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="section-label">Latest listings</div>
            <h2 className="font-display text-2xl font-bold text-[#1A1F2E] md:text-3xl">Featured Cars For Sale</h2>
            <p className="mt-2 max-w-xl text-[#6B7280]">
              Live listings from sellers across Ghana — updated as soon as they are published.
            </p>
          </div>
          <Link
            href="/cars"
            className="btn-primary font-display hidden shrink-0 items-center gap-1.5 rounded-lg px-5 py-3 text-sm font-semibold sm:flex"
          >
            View all
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {cars.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E2E6EA] bg-white p-10 text-center text-[#6B7280]">
            <p className="font-display font-semibold text-[#1A1F2E]">No published listings yet.</p>
            <p className="mt-2 text-sm">
              When submissions are approved in the admin dashboard, they appear here. Check Supabase env and{" "}
              <code className="rounded bg-[#F4F6F8] px-1">NEXT_PUBLIC_LISTING_STATUSES</code>.
            </p>
            <Link href="/sell" className="btn-primary mt-6 inline-block rounded-lg px-6 py-3 text-sm font-semibold">
              List your car →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
            {cars.map((car) => (
              <CarListingCard key={car.id} car={car} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/cars"
            className="btn-primary font-display inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold"
          >
            Browse all cars
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
