export const ADMIN_LISTING_STATUSES = [
  "new",
  "contacted",
  "completed",
  "rejected",
  "archived",
] as const;
export type AdminListingStatus = (typeof ADMIN_LISTING_STATUSES)[number];

export function isAdminListingStatus(s: unknown): s is AdminListingStatus {
  return typeof s === "string" && (ADMIN_LISTING_STATUSES as readonly string[]).includes(s);
}

/** Public fields accepted from the sell form / API (no id, timestamps). */
export type CarSubmissionInsertInput = {
  car_make: string;
  car_model: string;
  year: string;
  price: string;
  mileage: string;
  location: string;
  package_type: string;
  car_condition: string;
  transmission: string;
  fuel_type: string;
  car_description: string;
  seller_name: string;
  seller_phone: string;
  seller_email: string;
  preferred_contact: string;
  additional_info?: string;
  photos?: string[] | null;
  photo_metadata?: object[] | null;
};

export type BuildInsertResult =
  | { ok: true; row: Record<string, unknown> }
  | { ok: false; error: string };

function parseMoneyCedis(raw: string): number | null {
  const cleaned = raw.replace(/[,\s]/g, "").replace(/^₵/, "").trim();
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseMileageKm(raw: string): number | null {
  const cleaned = raw.replace(/[,\s]/g, "").trim();
  if (!cleaned) return null;
  const n = Number.parseInt(cleaned, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * Builds the row Supabase expects. Keeps `year` as a string/varchar-safe value
 * (including "Older") — if your DB column is INTEGER only, add a migration to use TEXT or year_numeric.
 */
export function buildCarSubmissionRow(input: CarSubmissionInsertInput): BuildInsertResult {
  const car_make = input.car_make.trim();
  const car_model = input.car_model.trim();
  if (!car_make || !car_model) {
    return { ok: false, error: "Make and model are required." };
  }

  const year = input.year.trim();
  if (!year) {
    return { ok: false, error: "Year is required." };
  }

  const price = parseMoneyCedis(input.price);
  if (price == null) {
    return { ok: false, error: "Enter a valid asking price (numbers only, e.g. 85000)." };
  }

  const mileage = parseMileageKm(input.mileage);
  if (mileage == null) {
    return { ok: false, error: "Enter a valid mileage in km (whole numbers)." };
  }

  const location = input.location.trim();
  if (!location) {
    return { ok: false, error: "Location is required." };
  }

  const seller_name = input.seller_name.trim();
  const seller_phone = input.seller_phone.trim();
  if (!seller_name || !seller_phone) {
    return { ok: false, error: "Name and phone are required." };
  }

  const seller_email = input.seller_email.trim();
  const preferred_contact = input.preferred_contact.trim();
  if (!preferred_contact) {
    return { ok: false, error: "Preferred contact is required." };
  }

  const package_type = input.package_type.trim();
  if (!["free", "premium", "complete"].includes(package_type)) {
    return { ok: false, error: "Invalid package selection." };
  }

  const car_condition = input.car_condition.trim();
  const transmission = input.transmission.trim();
  const fuel_type = input.fuel_type.trim();
  const car_description = input.car_description.trim();
  if (!car_condition || !car_description) {
    return { ok: false, error: "Condition and description are required." };
  }
  if (!transmission) {
    return { ok: false, error: "Transmission is required." };
  }
  if (!fuel_type) {
    return { ok: false, error: "Fuel type is required." };
  }

  const photos = input.photos?.length ? input.photos : null;
  const photo_metadata = input.photo_metadata?.length ? input.photo_metadata : null;

  const row: Record<string, unknown> = {
    car_make,
    car_model,
    year,
    price,
    mileage,
    location,
    package_type,
    car_condition,
    transmission,
    fuel_type,
    car_description,
    seller_name,
    seller_phone,
    seller_email: seller_email.length > 0 ? seller_email : null,
    preferred_contact,
    additional_info: (input.additional_info ?? "").trim() || null,
    status: "new",
    photos,
    photo_metadata,
  };

  const yearCol = process.env.CAR_SUBMISSIONS_YEAR_COLUMN?.trim();
  if (yearCol) {
    const yn = parseYearNumeric(year);
    if (yn != null) {
      row.year_numeric = yn;
    }
  }

  return { ok: true, row };
}

function parseYearNumeric(year: string): number | null {
  if (year === "Older") return null;
  const n = Number.parseInt(year.replace(/\D/g, "").slice(0, 4), 10);
  return Number.isFinite(n) && n >= 1950 && n <= 2100 ? n : null;
}

export function formatSupabaseInsertError(err: { message: string; details?: string; hint?: string }): string {
  const parts = [err.message, err.details, err.hint].filter(Boolean);
  let msg = parts.join(" — ");
  if (/row-level security/i.test(msg) || /RLS/i.test(msg)) {
    msg +=
      " If you are the site owner, add SUPABASE_SERVICE_ROLE_KEY to the server environment, or allow INSERT on car_submissions for the anon role in Supabase.";
  }
  return msg;
}
