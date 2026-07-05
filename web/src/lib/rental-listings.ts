import type { RentalListingWithPartner } from "@/types/rental-listing";
import { createClient } from "@/lib/supabase/server";

const RENTAL_SELECT = "*, rental_partners!inner(id, business_name, location, whatsapp_number, contact_phone, status)";

export function getRentalListingStatuses(): string[] {
  const raw = process.env.NEXT_PUBLIC_RENTAL_LISTING_STATUSES ?? "active";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Server-only. Default 12, clamped 4–100. */
export function getRentalsPageSize(): number {
  const raw = process.env.RENTALS_PAGE_SIZE;
  const n = raw ? parseInt(raw, 10) : NaN;
  if (!Number.isFinite(n)) return 12;
  return Math.min(100, Math.max(4, n));
}

export type RentalListingFilters = {
  make?: string;
  location?: string;
  vehicleCategory?: string;
  transmission?: string;
  fuelType?: string;
  minDailyRate?: number;
  maxDailyRate?: number;
  minYear?: number;
  maxYear?: number;
  withDriver?: boolean;
  listingType?: "rent" | "lease" | "both";
};

export type RentalListingsPage = {
  listings: RentalListingWithPartner[];
  total: number;
  page: number;
  pageSize: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(q: any, statuses: string[], filters: RentalListingFilters): any {
  let query = q.in("status", statuses).eq("rental_partners.status", "approved");

  const make = filters.make?.trim();
  if (make) query = query.ilike("car_make", `%${make}%`);

  const location = filters.location?.trim();
  if (location) query = query.ilike("location", `%${location}%`);

  const category = filters.vehicleCategory?.trim();
  if (category) query = query.eq("vehicle_category", category);

  const trans = filters.transmission?.trim();
  if (trans) query = query.eq("transmission", trans);

  const fuel = filters.fuelType?.trim();
  if (fuel) query = query.eq("fuel_type", fuel);

  if (filters.minDailyRate != null && !Number.isNaN(filters.minDailyRate)) {
    query = query.gte("daily_rate", filters.minDailyRate);
  }
  if (filters.maxDailyRate != null && !Number.isNaN(filters.maxDailyRate)) {
    query = query.lte("daily_rate", filters.maxDailyRate);
  }
  if (filters.minYear != null && !Number.isNaN(filters.minYear)) {
    query = query.gte("year_numeric", filters.minYear);
  }
  if (filters.maxYear != null && !Number.isNaN(filters.maxYear)) {
    query = query.lte("year_numeric", filters.maxYear);
  }
  if (filters.withDriver) {
    query = query.eq("with_driver_available", true);
  }
  if (filters.listingType) {
    // 'rent' → show 'rent' and 'both'; 'lease' → show 'lease' and 'both'; 'both' → show 'both' only
    const types = filters.listingType === "both" ? ["both"] : [filters.listingType, "both"];
    query = query.in("listing_type", types);
  }

  return query;
}

export async function fetchActiveRentalListings(
  filters: RentalListingFilters = {},
  options: { limit?: number } = {}
): Promise<RentalListingWithPartner[]> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return [];
  }
  const statuses = getRentalListingStatuses();
  if (statuses.length === 0) return [];

  let query = supabase.from("rental_listings").select(RENTAL_SELECT).order("created_at", { ascending: false });
  query = applyFilters(query, statuses, filters);
  if (options.limit != null) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) {
    console.error("fetchActiveRentalListings", error);
    return [];
  }
  return (data ?? []) as RentalListingWithPartner[];
}

export async function fetchActiveRentalListingsPage(
  filters: RentalListingFilters,
  options: { page: number; pageSize?: number }
): Promise<RentalListingsPage> {
  const pageSize = options.pageSize ?? getRentalsPageSize();
  let page = Math.max(1, Math.floor(Number(options.page)) || 1);

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { listings: [], total: 0, page: 1, pageSize };
  }

  const statuses = getRentalListingStatuses();
  if (statuses.length === 0) {
    return { listings: [], total: 0, page: 1, pageSize };
  }

  let countBuilder = supabase.from("rental_listings").select("*, rental_partners!inner(status)", {
    count: "exact",
    head: true,
  });
  countBuilder = applyFilters(countBuilder, statuses, filters);

  const { count, error: countErr } = await countBuilder;
  if (countErr) {
    console.error("fetchActiveRentalListingsPage count", countErr);
    return { listings: [], total: 0, page: 1, pageSize };
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  page = Math.min(page, totalPages);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let dataBuilder = supabase.from("rental_listings").select(RENTAL_SELECT);
  dataBuilder = applyFilters(dataBuilder, statuses, filters);
  dataBuilder = dataBuilder.order("created_at", { ascending: false }).range(from, to);

  const { data, error } = await dataBuilder;
  if (error) {
    console.error("fetchActiveRentalListingsPage", error);
    return { listings: [], total: 0, page: 1, pageSize };
  }

  return { listings: (data ?? []) as RentalListingWithPartner[], total, page, pageSize };
}

const SITEMAP_RENTAL_CAP = 2500;

export async function fetchActiveRentalListingIdsForSitemap(): Promise<number[]> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return [];
  }
  const statuses = getRentalListingStatuses();
  if (statuses.length === 0) return [];

  const query = supabase
    .from("rental_listings")
    .select("id, rental_partners!inner(status)")
    .in("status", statuses)
    .eq("rental_partners.status", "approved")
    .order("created_at", { ascending: false })
    .limit(SITEMAP_RENTAL_CAP);

  const { data, error } = await query;
  if (error) {
    console.error("fetchActiveRentalListingIdsForSitemap", error);
    return [];
  }
  return (data ?? []).map((r: { id: number }) => r.id);
}

export async function fetchActiveRentalListingById(id: number): Promise<RentalListingWithPartner | null> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return null;
  }
  const statuses = getRentalListingStatuses();
  const { data, error } = await supabase
    .from("rental_listings")
    .select(RENTAL_SELECT)
    .eq("id", id)
    .in("status", statuses)
    .eq("rental_partners.status", "approved")
    .maybeSingle();

  if (error) {
    console.error("fetchActiveRentalListingById", error);
    return null;
  }
  return (data as RentalListingWithPartner) ?? null;
}
