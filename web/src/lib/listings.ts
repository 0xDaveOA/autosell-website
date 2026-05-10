import type { CarSubmission } from "@/types/car-submission";
import { parseListingYear } from "@/types/car-submission";
import { createClient } from "@/lib/supabase/server";

export function getListingStatuses(): string[] {
  const raw = process.env.NEXT_PUBLIC_LISTING_STATUSES ?? "completed";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export type ListingFilters = {
  make?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  transmission?: string;
  fuelType?: string;
};

/** Server-only. Default 12, clamped 4–100. */
export function getCarsPageSize(): number {
  const raw = process.env.CARS_PAGE_SIZE;
  const n = raw ? parseInt(raw, 10) : NaN;
  if (!Number.isFinite(n)) return 12;
  return Math.min(100, Math.max(4, n));
}

/**
 * Optional integer column on `car_submissions` (e.g. `year_numeric`) used for SQL-side year filters.
 * When unset, year min/max still work via in-memory filtering (heavier at scale).
 */
export function getListingYearColumn(): string | undefined {
  const c = process.env.CAR_SUBMISSIONS_YEAR_COLUMN?.trim();
  return c || undefined;
}

export type PublishedListingsPage = {
  listings: CarSubmission[];
  total: number;
  page: number;
  pageSize: number;
};

export async function fetchPublishedListings(
  filters: ListingFilters = {},
  options: { limit?: number } = {}
): Promise<CarSubmission[]> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return [];
  }
  const statuses = getListingStatuses();
  if (statuses.length === 0) return [];

  const hasYearFilter = filters.minYear != null || filters.maxYear != null;
  const yearCol = getListingYearColumn();
  const sqlYear = Boolean(yearCol && hasYearFilter);

  let query = supabase
    .from("car_submissions")
    .select("*")
    .in("status", statuses)
    .order("created_at", { ascending: false });

  const make = filters.make?.trim();
  if (make) query = query.ilike("car_make", `%${make}%`);

  const location = filters.location?.trim();
  if (location) query = query.ilike("location", `%${location}%`);

  const trans = filters.transmission?.trim();
  if (trans) query = query.eq("transmission", trans);

  const fuel = filters.fuelType?.trim();
  if (fuel) query = query.eq("fuel_type", fuel);

  if (filters.minPrice != null && !Number.isNaN(filters.minPrice)) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters.maxPrice != null && !Number.isNaN(filters.maxPrice)) {
    query = query.lte("price", filters.maxPrice);
  }

  if (sqlYear && yearCol) {
    if (filters.minYear != null) query = query.gte(yearCol, filters.minYear);
    if (filters.maxYear != null) query = query.lte(yearCol, filters.maxYear);
  }

  if (options.limit != null && (!hasYearFilter || sqlYear)) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("fetchPublishedListings", error);
    return [];
  }

  let rows = (data ?? []) as CarSubmission[];

  if (!sqlYear && hasYearFilter) {
    if (filters.minYear != null) {
      rows = rows.filter((r) => {
        const y = parseListingYear(r.year);
        return y != null && y >= filters.minYear!;
      });
    }
    if (filters.maxYear != null) {
      rows = rows.filter((r) => {
        const y = parseListingYear(r.year);
        return y != null && y <= filters.maxYear!;
      });
    }
  }

  if (options.limit != null && hasYearFilter && !sqlYear) {
    rows = rows.slice(0, options.limit);
  }

  return rows;
}

/**
 * Paginated listings for /cars. Uses Supabase count + range when year filters run in SQL or when there is no year filter.
 * Falls back to in-memory year filtering only when year filters are set and CAR_SUBMISSIONS_YEAR_COLUMN is unset.
 */
export async function fetchPublishedListingsPage(
  filters: ListingFilters,
  options: { page: number; pageSize?: number }
): Promise<PublishedListingsPage> {
  const pageSize = options.pageSize ?? getCarsPageSize();
  let page = Math.max(1, Math.floor(Number(options.page)) || 1);

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { listings: [], total: 0, page: 1, pageSize };
  }

  const statuses = getListingStatuses();
  if (statuses.length === 0) {
    return { listings: [], total: 0, page: 1, pageSize };
  }

  const hasYearFilter = filters.minYear != null || filters.maxYear != null;
  const yearCol = getListingYearColumn();
  const sqlYear = Boolean(yearCol && hasYearFilter);

  const make = filters.make?.trim();
  const location = filters.location?.trim();

  const applyBaseFilters = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    q: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any => {
    let query = q.in("status", statuses);
    if (make) query = query.ilike("car_make", `%${make}%`);
    if (location) query = query.ilike("location", `%${location}%`);
    const trans = filters.transmission?.trim();
    if (trans) query = query.eq("transmission", trans);
    const fuel = filters.fuelType?.trim();
    if (fuel) query = query.eq("fuel_type", fuel);
    if (filters.minPrice != null && !Number.isNaN(filters.minPrice)) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters.maxPrice != null && !Number.isNaN(filters.maxPrice)) {
      query = query.lte("price", filters.maxPrice);
    }
    return query;
  };

  const applyYearSql = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    q: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any => {
    if (!sqlYear || !yearCol) return q;
    let query = q;
    if (filters.minYear != null) query = query.gte(yearCol, filters.minYear);
    if (filters.maxYear != null) query = query.lte(yearCol, filters.maxYear);
    return query;
  };

  if (!hasYearFilter || sqlYear) {
    let countBuilder = supabase
      .from("car_submissions")
      .select("*", { count: "exact", head: true });
    countBuilder = applyYearSql(applyBaseFilters(countBuilder));

    const { count, error: countErr } = await countBuilder;
    if (countErr) {
      console.error("fetchPublishedListingsPage count", countErr);
      return { listings: [], total: 0, page: 1, pageSize };
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    page = Math.min(page, totalPages);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let dataBuilder = supabase.from("car_submissions").select("*");
    dataBuilder = applyYearSql(applyBaseFilters(dataBuilder));
    dataBuilder = dataBuilder.order("created_at", { ascending: false }).range(from, to);

    const { data, error } = await dataBuilder;
    if (error) {
      console.error("fetchPublishedListingsPage", error);
      return { listings: [], total: 0, page: 1, pageSize };
    }

    return {
      listings: (data ?? []) as CarSubmission[],
      total,
      page,
      pageSize,
    };
  }

  let memoryBuilder = supabase.from("car_submissions").select("*");
  memoryBuilder = applyBaseFilters(memoryBuilder);
  memoryBuilder = memoryBuilder.order("created_at", { ascending: false });

  const { data, error } = await memoryBuilder;
  if (error) {
    console.error("fetchPublishedListingsPage", error);
    return { listings: [], total: 0, page: 1, pageSize };
  }

  let rows = (data ?? []) as CarSubmission[];

  if (filters.minYear != null) {
    rows = rows.filter((r) => {
      const y = parseListingYear(r.year);
      return y != null && y >= filters.minYear!;
    });
  }
  if (filters.maxYear != null) {
    rows = rows.filter((r) => {
      const y = parseListingYear(r.year);
      return y != null && y <= filters.maxYear!;
    });
  }

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  page = Math.min(page, totalPages);
  const start = (page - 1) * pageSize;
  const listings = rows.slice(start, start + pageSize);

  return { listings, total, page, pageSize };
}

const SITEMAP_LISTING_CAP = 2500;

/** Public listing IDs for SEO sitemap (anon + RLS). */
export async function fetchPublishedListingIdsForSitemap(): Promise<number[]> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return [];
  }
  const statuses = getListingStatuses();
  if (statuses.length === 0) return [];

  const { data, error } = await supabase
    .from("car_submissions")
    .select("id")
    .in("status", statuses)
    .order("created_at", { ascending: false })
    .limit(SITEMAP_LISTING_CAP);

  if (error) {
    console.error("fetchPublishedListingIdsForSitemap", error);
    return [];
  }

  return (data ?? []).map((r: { id: number }) => r.id);
}

export async function fetchPublishedListingById(
  id: number
): Promise<CarSubmission | null> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return null;
  }
  const statuses = getListingStatuses();
  const { data, error } = await supabase
    .from("car_submissions")
    .select("*")
    .eq("id", id)
    .in("status", statuses)
    .maybeSingle();

  if (error) {
    console.error("fetchPublishedListingById", error);
    return null;
  }
  return (data as CarSubmission) ?? null;
}
