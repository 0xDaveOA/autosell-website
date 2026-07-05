import Link from "next/link";
import type { Metadata } from "next";
import { fetchActiveRentalListingsPage, getRentalsPageSize } from "@/lib/rental-listings";
import { RentalListingCard } from "@/components/RentalListingCard";
import { CarsPagination } from "@/components/cars/CarsPagination";
import { TRANSMISSION_OPTIONS, FUEL_TYPE_OPTIONS } from "@/lib/listing-filters";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Rent or Lease a Car in Ghana | AutoSell Ghana",
  description:
    "Browse daily rentals and long-term leases from local partners across Ghana. Filter by make, rate, location — enquire directly via WhatsApp.",
  alternates: { canonical: "/rentals" },
  openGraph: {
    title: "Rent or Lease a Car in Ghana | AutoSell Ghana",
    description: "Daily hire or long-term lease — filter vehicles across Accra, Kumasi, and more.",
    url: `${getSiteUrl()}/rentals`,
  },
};

export const dynamic = "force-dynamic";

type Search = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

function rentalsHref(
  args: {
    make: string;
    location: string;
    transmission: string;
    fuelType: string;
    minDailyRate?: number;
    maxDailyRate?: number;
    minYear?: number;
    maxYear?: number;
    type?: string;
  },
  targetPage: number
): string {
  const p = new URLSearchParams();
  if (args.make) p.set("make", args.make);
  if (args.location) p.set("location", args.location);
  if (args.transmission) p.set("transmission", args.transmission);
  if (args.fuelType) p.set("fuelType", args.fuelType);
  if (args.minDailyRate !== undefined) p.set("minDailyRate", String(args.minDailyRate));
  if (args.maxDailyRate !== undefined) p.set("maxDailyRate", String(args.maxDailyRate));
  if (args.minYear !== undefined) p.set("minYear", String(args.minYear));
  if (args.maxYear !== undefined) p.set("maxYear", String(args.maxYear));
  if (args.type) p.set("type", args.type);
  if (targetPage > 1) p.set("page", String(targetPage));
  const qs = p.toString();
  return qs ? `/rentals?${qs}` : "/rentals";
}

const TYPE_TABS = [
  { label: "All vehicles", value: "" },
  { label: "Daily rental", value: "rent" },
  { label: "Long-term lease", value: "lease" },
] as const;

export default async function RentalsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const make = first(sp.make).trim();
  const location = first(sp.location).trim();
  let minDailyRate = first(sp.minDailyRate) ? Number(first(sp.minDailyRate)) : undefined;
  let maxDailyRate = first(sp.maxDailyRate) ? Number(first(sp.maxDailyRate)) : undefined;
  if (!Number.isFinite(minDailyRate!)) minDailyRate = undefined;
  if (!Number.isFinite(maxDailyRate!)) maxDailyRate = undefined;

  const minYear = first(sp.minYear) ? Number(first(sp.minYear)) : undefined;
  const maxYear = first(sp.maxYear) ? Number(first(sp.maxYear)) : undefined;

  const transmission = first(sp.transmission).trim();
  const fuelType = first(sp.fuelType).trim();
  const withDriver = first(sp.withDriver) === "1";
  const typeParam = first(sp.type).trim();
  const listingType =
    typeParam === "rent" || typeParam === "lease" || typeParam === "both"
      ? (typeParam as "rent" | "lease" | "both")
      : undefined;

  const rawPage = first(sp.page);
  const requestedPage = Math.max(1, Math.floor(Number(rawPage)) || 1);

  const filters = {
    make: make || undefined,
    location: location || undefined,
    minDailyRate: Number.isFinite(minDailyRate) ? minDailyRate : undefined,
    maxDailyRate: Number.isFinite(maxDailyRate) ? maxDailyRate : undefined,
    minYear: Number.isFinite(minYear) ? minYear : undefined,
    maxYear: Number.isFinite(maxYear) ? maxYear : undefined,
    transmission: transmission || undefined,
    fuelType: fuelType || undefined,
    withDriver: withDriver || undefined,
    listingType,
  };

  const { listings: rentals, total, page, pageSize } = await fetchActiveRentalListingsPage(filters, {
    page: requestedPage,
    pageSize: getRentalsPageSize(),
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const hrefBase = {
    make,
    location,
    transmission,
    fuelType,
    minDailyRate: filters.minDailyRate,
    maxDailyRate: filters.maxDailyRate,
    minYear: filters.minYear,
    maxYear: filters.maxYear,
    type: typeParam,
  };

  const currentY = new Date().getFullYear();
  const yearOpts: number[] = [];
  for (let i = currentY; i >= 1990; i--) yearOpts.push(i);

  return (
    <>
      {/* ── Hero ── */}
      <div className="bg-[#00875a] px-5 py-14 text-center md:px-8 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} className="h-9 w-9">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Rent or Lease a Car in Ghana
          </h1>
          <p className="mt-4 text-lg text-green-100">
            Daily hire or long-term lease — browse verified vehicles from local rental partners and message them directly.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#browse"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#00875a] shadow transition-opacity hover:opacity-90"
            >
              Browse vehicles
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06L7.25 11.44V2.75A.75.75 0 0 1 8 2Z" clipRule="evenodd" />
              </svg>
            </a>
            <Link
              href="/rent-with-us"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              List your fleet →
            </Link>
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="border-b border-[var(--border)] bg-white px-5 py-10 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                n: "1",
                icon: "🔍",
                title: "Browse & filter",
                desc: "Search by make, location, price range, and whether you need a driver.",
              },
              {
                n: "2",
                icon: "🚗",
                title: "Pick your car",
                desc: "Daily rental or long-term lease — each listing shows the partner's own rates.",
              },
              {
                n: "3",
                icon: "💬",
                title: "WhatsApp the partner",
                desc: "Message the rental partner directly to check availability and confirm booking.",
              },
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-start gap-3 sm:items-center sm:text-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e6f6f0] text-xl">
                  {s.icon}
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-[#1a1f2e]">{s.title}</p>
                  <p className="mt-0.5 text-sm text-[#6B7280]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Browse section ── */}
      <div id="browse" className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        {/* Type tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TYPE_TABS.map((tab) => {
            const active = typeParam === tab.value;
            const href = tab.value
              ? `/rentals?type=${tab.value}`
              : "/rentals";
            return (
              <Link
                key={tab.value}
                href={href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#E8500A] text-white shadow-sm"
                    : "border border-[var(--border)] bg-white text-[#4B5563] hover:border-[#E8500A]/50 hover:text-[#E8500A]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          <aside className="lg:sticky lg:top-[calc(var(--nav-height)+16px)] lg:w-80 lg:shrink-0">
            <form
              method="GET"
              action="/rentals"
              className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4 shadow-sm md:p-5"
            >
              {typeParam && <input type="hidden" name="type" value={typeParam} />}
              <div>
                <h2 className="font-display text-sm font-bold text-[var(--color-secondary)]">Filters</h2>
                <p className="text-xs text-neutral-500">Adjust and apply — results update on this page.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">Make</label>
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
                    Min ₵/day
                  </label>
                  <input
                    name="minDailyRate"
                    type="number"
                    min={0}
                    defaultValue={minDailyRate !== undefined ? String(minDailyRate) : first(sp.minDailyRate)}
                    placeholder="0"
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-white px-2 py-2.5 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Max ₵/day
                  </label>
                  <input
                    name="maxDailyRate"
                    type="number"
                    min={0}
                    defaultValue={maxDailyRate !== undefined ? String(maxDailyRate) : first(sp.maxDailyRate)}
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
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input type="checkbox" name="withDriver" value="1" defaultChecked={withDriver} className="h-4 w-4" />
                With driver available
              </label>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white hover:brightness-95"
                >
                  Apply filters
                </button>
                <Link
                  href={typeParam ? `/rentals?type=${typeParam}` : "/rentals"}
                  className="block w-full rounded-xl border border-[var(--color-border)] bg-white py-2.5 text-center text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Reset filters
                </Link>
              </div>
            </form>

            {/* Partner CTA */}
            <div className="mt-4 rounded-2xl border border-[#00875a]/20 bg-[#e6f6f0] p-4 text-center">
              <p className="text-sm font-semibold text-[#1a1f2e]">Run a car rental business?</p>
              <p className="mt-1 text-xs text-[#4B5563]">List your fleet for free.</p>
              <Link
                href="/rent-with-us"
                className="mt-3 inline-block rounded-lg bg-[#00875a] px-4 py-2 text-xs font-bold text-white hover:opacity-90"
              >
                Partner with us →
              </Link>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <p className="mb-6 text-sm text-neutral-600">
              {total === 0 ? (
                <>No vehicles match these filters yet.</>
              ) : (
                <>
                  <strong>{total}</strong> vehicle{total === 1 ? "" : "s"} match your filters
                  {totalPages > 1 ? (
                    <>
                      {" "}
                      (page <strong>{page}</strong> of <strong>{totalPages}</strong>)
                    </>
                  ) : null}
                </>
              )}
            </p>

            {rentals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-12 text-center text-neutral-600">
                No vehicles match these filters, or nothing is published yet.
                <div className="mt-4">
                  <Link href="/rent-with-us" className="font-semibold text-[var(--color-primary)] hover:underline">
                    List your rental fleet
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 xl:grid-cols-3 xl:gap-8">
                  {rentals.map((rental) => (
                    <RentalListingCard key={rental.id} rental={rental} />
                  ))}
                </div>
                <CarsPagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  hrefForPage={(n) => rentalsHref(hrefBase, n)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
