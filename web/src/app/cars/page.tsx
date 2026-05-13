import Link from "next/link";
import type { Metadata } from "next";
import { fetchPublishedListingsPage, getCarsPageSize } from "@/lib/listings";
import { CarListingCard } from "@/components/CarListingCard";
import { CarsPagination } from "@/components/cars/CarsPagination";
import { TRANSMISSION_OPTIONS, FUEL_TYPE_OPTIONS } from "@/lib/listing-filters";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Browse cars",
  description:
    "Search cars for sale in Ghana by make, price, location, year, transmission, and fuel — enquire via WhatsApp through AutoSell.",
  alternates: { canonical: "/cars" },
  openGraph: {
    title: "Browse cars | AutoSell Ghana",
    description: "Filter listings across Accra, Kumasi, and more. Message AutoSell on WhatsApp to enquire.",
    url: `${getSiteUrl()}/cars`,
  },
};

export const dynamic = "force-dynamic";

type Search = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

/** Hero search sends `price` like `0-50000` or `500000-` (open max). */
function parseHeroPriceBracket(raw: string): { min?: number; max?: number } {
  const v = raw.trim();
  if (!v) return {};
  if (v.endsWith("-")) {
    const min = Number(v.slice(0, -1));
    return Number.isFinite(min) ? { min } : {};
  }
  const parts = v.split("-");
  if (parts.length >= 2) {
    const low = Number(parts[0]);
    const high = Number(parts[1]);
    const out: { min?: number; max?: number } = {};
    if (Number.isFinite(low)) out.min = low;
    if (parts[1] !== "" && Number.isFinite(high)) out.max = high;
    return out;
  }
  return {};
}

function carsHref(
  args: {
    make: string;
    location: string;
    transmission: string;
    fuelType: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
  },
  targetPage: number
): string {
  const p = new URLSearchParams();
  if (args.make) p.set("make", args.make);
  if (args.location) p.set("location", args.location);
  if (args.transmission) p.set("transmission", args.transmission);
  if (args.fuelType) p.set("fuelType", args.fuelType);
  if (args.minPrice !== undefined) p.set("minPrice", String(args.minPrice));
  if (args.maxPrice !== undefined) p.set("maxPrice", String(args.maxPrice));
  if (args.minYear !== undefined) p.set("minYear", String(args.minYear));
  if (args.maxYear !== undefined) p.set("maxYear", String(args.maxYear));
  if (targetPage > 1) p.set("page", String(targetPage));
  const qs = p.toString();
  return qs ? `/cars?${qs}` : "/cars";
}

export default async function CarsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const make = first(sp.make).trim();
  const location = first(sp.location).trim();
  let minPrice = first(sp.minPrice) ? Number(first(sp.minPrice)) : undefined;
  let maxPrice = first(sp.maxPrice) ? Number(first(sp.maxPrice)) : undefined;
  if (!Number.isFinite(minPrice!)) minPrice = undefined;
  if (!Number.isFinite(maxPrice!)) maxPrice = undefined;

  const priceBracketRaw = first(sp.price).trim();
  if (priceBracketRaw) {
    const bracket = parseHeroPriceBracket(priceBracketRaw);
    if (minPrice === undefined && bracket.min !== undefined) minPrice = bracket.min;
    if (maxPrice === undefined && bracket.max !== undefined) maxPrice = bracket.max;
  }
  const minYear = first(sp.minYear) ? Number(first(sp.minYear)) : undefined;
  const maxYear = first(sp.maxYear) ? Number(first(sp.maxYear)) : undefined;

  const transmission = first(sp.transmission).trim();
  const fuelType = first(sp.fuelType).trim();

  const rawPage = first(sp.page);
  const requestedPage = Math.max(1, Math.floor(Number(rawPage)) || 1);

  const filters = {
    make: make || undefined,
    location: location || undefined,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    minYear: Number.isFinite(minYear) ? minYear : undefined,
    maxYear: Number.isFinite(maxYear) ? maxYear : undefined,
    transmission: transmission || undefined,
    fuelType: fuelType || undefined,
  };

  const { listings: cars, total, page, pageSize } = await fetchPublishedListingsPage(filters, {
    page: requestedPage,
    pageSize: getCarsPageSize(),
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const hrefBase = {
    make,
    location,
    transmission,
    fuelType,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minYear: filters.minYear,
    maxYear: filters.maxYear,
  };

  const currentY = new Date().getFullYear();
  const yearOpts: number[] = [];
  for (let i = currentY; i >= 1990; i--) yearOpts.push(i);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[var(--color-secondary)] md:text-4xl">
          Browse cars
        </h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Filter by make, price, location, year, transmission, and fuel type. Cards show a photo gallery; open details
          or message AutoSell on WhatsApp to enquire.
        </p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <aside className="lg:sticky lg:top-[calc(var(--nav-height)+16px)] lg:w-80 lg:shrink-0">
          <form
            method="GET"
            action="/cars"
            className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4 shadow-sm md:p-5"
          >
            <div>
              <h2 className="font-display text-sm font-bold text-[var(--color-secondary)]">Filters</h2>
              <p className="text-xs text-neutral-500">Adjust and apply — results update on this page.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Make
              </label>
              <input
                name="make"
                defaultValue={make}
                placeholder="e.g. Toyota"
                className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Transmission
              </label>
              <select
                name="transmission"
                defaultValue={transmission}
                className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
              >
                <option value="">Any</option>
                {[...TRANSMISSION_OPTIONS].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Fuel type
              </label>
              <select
                name="fuelType"
                defaultValue={fuelType}
                className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
              >
                <option value="">Any</option>
                {[...FUEL_TYPE_OPTIONS].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Min ₵
                </label>
                <input
                  name="minPrice"
                  type="number"
                  min={0}
                  defaultValue={minPrice !== undefined ? String(minPrice) : first(sp.minPrice)}
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-white px-2 py-2.5 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Max ₵
                </label>
                <input
                  name="maxPrice"
                  type="number"
                  min={0}
                  defaultValue={maxPrice !== undefined ? String(maxPrice) : first(sp.maxPrice)}
                  placeholder="Any"
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-white px-2 py-2.5 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Location
              </label>
              <input
                name="location"
                defaultValue={location}
                placeholder="e.g. Accra"
                className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Min year
                </label>
                <select
                  name="minYear"
                  defaultValue={first(sp.minYear)}
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-white px-2 py-2.5 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
                >
                  <option value="">Any</option>
                  {yearOpts.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Max year
                </label>
                <select
                  name="maxYear"
                  defaultValue={first(sp.maxYear)}
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-white px-2 py-2.5 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
                >
                  <option value="">Any</option>
                  {yearOpts.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white hover:brightness-95"
              >
                Apply filters
              </button>
              <Link
                href="/cars"
                className="block w-full rounded-xl border border-[var(--color-border)] bg-white py-2.5 text-center text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Reset all
              </Link>
            </div>
          </form>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="mb-6 text-sm text-neutral-600">
            {total === 0 ? (
              <>No listings match these filters yet.</>
            ) : (
              <>
                <strong>{total}</strong> listing{total === 1 ? "" : "s"} match your filters
                {totalPages > 1 ? (
                  <>
                    {" "}
                    (page <strong>{page}</strong> of <strong>{totalPages}</strong>)
                  </>
                ) : null}
              </>
            )}
          </p>

          {cars.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-12 text-center text-neutral-600">
              No cars match these filters, or nothing is published yet.
              <div className="mt-4">
                <Link href="/sell" className="font-semibold text-[var(--color-primary)] hover:underline">
                  List your car
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 xl:grid-cols-3 xl:gap-8">
                {cars.map((car) => (
                  <CarListingCard key={car.id} car={car} />
                ))}
              </div>
              <CarsPagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                hrefForPage={(n) => carsHref(hrefBase, n)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
