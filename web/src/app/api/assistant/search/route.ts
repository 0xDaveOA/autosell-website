import { NextResponse } from "next/server";
import { fetchPublishedListings } from "@/lib/listings";
import { fetchActiveRentalListings } from "@/lib/rental-listings";
import { normalizePhotos } from "@/types/car-submission";
import type { AssistantSearchResult } from "@/types/assistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMIT = 4;

// Best-effort per-instance rate limiter. On Vercel each instance keeps its own
// map, so this is not a hard global limit — acceptable for a read-only query
// capped at 4 rows that is no heavier than the public /cars page.
const WINDOW_MS = 60_000;
const MAX_REQ = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQ;
}

/** Strip ilike wildcards and anything that isn't a letter, digit, space, or common name punctuation. */
function cleanText(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw
    .trim()
    .slice(0, 32)
    .replace(/[%_]/g, "")
    .replace(/[^\p{L}\p{N} .\-']/gu, "")
    .trim();
  return cleaned || undefined;
}

function cleanPrice(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 10_000_000) return undefined;
  return Math.floor(n);
}

export async function GET(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const vertical = searchParams.get("vertical");
  if (vertical !== "cars" && vertical !== "rentals") {
    return NextResponse.json({ error: "Invalid vertical." }, { status: 400 });
  }

  const make = cleanText(searchParams.get("make"));
  const location = cleanText(searchParams.get("location"));
  const minPrice = cleanPrice(searchParams.get("minPrice"));
  const maxPrice = cleanPrice(searchParams.get("maxPrice"));

  let results: AssistantSearchResult[] = [];

  if (vertical === "cars") {
    const rows = await fetchPublishedListings(
      { make, location, minPrice, maxPrice },
      { limit: LIMIT }
    );
    // Slim DTO only — raw rows contain seller_phone / seller_email.
    results = rows.map((r) => ({
      id: r.id,
      vertical: "cars",
      title: `${r.car_make} ${r.car_model}`.trim(),
      priceLabel: `₵${r.price.toLocaleString("en-GH")}`,
      location: r.location,
      photo: normalizePhotos(r.photos)[0] ?? null,
      url: `/cars/${r.id}`,
    }));
  } else {
    const rows = await fetchActiveRentalListings(
      { make, location, minDailyRate: minPrice, maxDailyRate: maxPrice },
      { limit: LIMIT }
    );
    results = rows.map((r) => ({
      id: r.id,
      vertical: "rentals",
      title: `${r.car_make} ${r.car_model}`.trim(),
      priceLabel:
        r.listing_type === "lease" && r.monthly_rate
          ? `₵${r.monthly_rate.toLocaleString("en-GH")}/mo`
          : `₵${r.daily_rate.toLocaleString("en-GH")}/day`,
      location: r.location,
      photo: normalizePhotos(r.photos)[0] ?? null,
      url: `/rentals/${r.id}`,
    }));
  }

  return NextResponse.json({ ok: true, results });
}
