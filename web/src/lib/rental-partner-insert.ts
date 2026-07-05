/** Max photos accepted per vehicle from the public rental signup form. */
export const RENTAL_SIGNUP_MAX_PHOTOS_PER_VEHICLE = 6;

/** Max vehicles accepted in a single rental signup submission. */
export const RENTAL_SIGNUP_MAX_VEHICLES = 10;

export const ADMIN_PARTNER_STATUSES = ["pending", "approved", "rejected"] as const;
export type AdminPartnerStatus = (typeof ADMIN_PARTNER_STATUSES)[number];

export function isAdminPartnerStatus(s: unknown): s is AdminPartnerStatus {
  return typeof s === "string" && (ADMIN_PARTNER_STATUSES as readonly string[]).includes(s);
}

export const ADMIN_RENTAL_LISTING_STATUSES = ["pending", "active", "rejected", "archived"] as const;
export type AdminRentalListingStatus = (typeof ADMIN_RENTAL_LISTING_STATUSES)[number];

export function isAdminRentalListingStatus(s: unknown): s is AdminRentalListingStatus {
  return typeof s === "string" && (ADMIN_RENTAL_LISTING_STATUSES as readonly string[]).includes(s);
}

export type RentalPartnerInsertInput = {
  business_name: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  whatsapp_number?: string;
  location: string;
  business_description?: string;
};

export type RentalVehicleInsertInput = {
  car_make: string;
  car_model: string;
  year: string;
  vehicle_category?: string;
  transmission?: string;
  fuel_type?: string;
  seats?: string;
  listing_type?: "rent" | "lease" | "both";
  daily_rate: string;
  monthly_rate?: string;
  with_driver_available?: boolean;
  self_drive_available?: boolean;
  location: string;
  description?: string;
  photos?: string[] | null;
  photo_metadata?: object[] | null;
};

export type BuildInsertResult =
  | { ok: true; row: Record<string, unknown> }
  | { ok: false; error: string };

export type BuildSignupResult =
  | { ok: true; partnerRow: Record<string, unknown>; vehicleRows: Record<string, unknown>[] }
  | { ok: false; error: string };

function parseMoneyCedis(raw: string): number | null {
  const cleaned = raw.replace(/[,\s]/g, "").replace(/^₵/, "").trim();
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseYearNumeric(year: string): number | null {
  if (year === "Older") return null;
  const n = Number.parseInt(year.replace(/\D/g, "").slice(0, 4), 10);
  return Number.isFinite(n) && n >= 1950 && n <= 2100 ? n : null;
}

export function buildRentalPartnerRow(input: RentalPartnerInsertInput): BuildInsertResult {
  const business_name = input.business_name.trim();
  if (!business_name) {
    return { ok: false, error: "Business name is required." };
  }

  const contact_name = input.contact_name.trim();
  const contact_phone = input.contact_phone.trim();
  if (!contact_name || !contact_phone) {
    return { ok: false, error: "Contact name and phone are required." };
  }

  const location = input.location.trim();
  if (!location) {
    return { ok: false, error: "Location is required." };
  }

  const contact_email = (input.contact_email ?? "").trim();
  const whatsapp_number = (input.whatsapp_number ?? "").trim();
  const business_description = (input.business_description ?? "").trim();

  const row: Record<string, unknown> = {
    business_name,
    contact_name,
    contact_phone,
    contact_email: contact_email.length > 0 ? contact_email : null,
    whatsapp_number: whatsapp_number.length > 0 ? whatsapp_number : contact_phone,
    location,
    business_description: business_description.length > 0 ? business_description : null,
    status: "pending",
  };

  return { ok: true, row };
}

export function buildRentalVehicleRow(
  input: RentalVehicleInsertInput,
  partnerId: number
): BuildInsertResult {
  const car_make = input.car_make.trim();
  const car_model = input.car_model.trim();
  if (!car_make || !car_model) {
    return { ok: false, error: "Vehicle make and model are required." };
  }

  const year = input.year.trim();
  if (!year) {
    return { ok: false, error: "Vehicle year is required." };
  }

  const listingType: "rent" | "lease" | "both" = input.listing_type ?? "rent";
  const daily_rate = parseMoneyCedis(input.daily_rate);
  const monthly_rate = input.monthly_rate ? parseMoneyCedis(input.monthly_rate) : null;

  if ((listingType === "rent" || listingType === "both") && daily_rate == null) {
    return { ok: false, error: "Enter a valid daily rate (numbers only, e.g. 350)." };
  }
  if ((listingType === "lease" || listingType === "both") && monthly_rate == null) {
    return { ok: false, error: "Enter a valid monthly rate (numbers only, e.g. 5000)." };
  }

  const location = input.location.trim();
  if (!location) {
    return { ok: false, error: "Vehicle pickup location is required." };
  }

  const seatsRaw = (input.seats ?? "").trim();
  const seats = seatsRaw ? Number.parseInt(seatsRaw, 10) : null;

  const photos = input.photos?.length ? input.photos : null;
  const photo_metadata = input.photo_metadata?.length ? input.photo_metadata : null;

  const row: Record<string, unknown> = {
    partner_id: partnerId,
    car_make,
    car_model,
    year,
    year_numeric: parseYearNumeric(year),
    vehicle_category: (input.vehicle_category ?? "").trim() || null,
    transmission: (input.transmission ?? "").trim() || null,
    fuel_type: (input.fuel_type ?? "").trim() || null,
    seats: Number.isFinite(seats) ? seats : null,
    listing_type: listingType,
    daily_rate: daily_rate ?? 0,
    monthly_rate: monthly_rate ?? null,
    with_driver_available: input.with_driver_available ?? false,
    self_drive_available: input.self_drive_available ?? true,
    location,
    description: (input.description ?? "").trim() || null,
    status: "pending",
    photos,
    photo_metadata,
  };

  return { ok: true, row };
}

/** Orchestrates partner + vehicle validation for a single signup submission. */
export function buildRentalSignupRows(
  partnerInput: RentalPartnerInsertInput,
  vehicles: RentalVehicleInsertInput[]
): BuildSignupResult {
  if (!vehicles.length) {
    return { ok: false, error: "Add at least one vehicle to your fleet." };
  }
  if (vehicles.length > RENTAL_SIGNUP_MAX_VEHICLES) {
    return { ok: false, error: `At most ${RENTAL_SIGNUP_MAX_VEHICLES} vehicles are allowed per signup.` };
  }

  const partnerBuilt = buildRentalPartnerRow(partnerInput);
  if (!partnerBuilt.ok) {
    return partnerBuilt;
  }

  const vehicleRows: Record<string, unknown>[] = [];
  for (const vehicle of vehicles) {
    if ((vehicle.photos?.length ?? 0) > RENTAL_SIGNUP_MAX_PHOTOS_PER_VEHICLE) {
      return {
        ok: false,
        error: `At most ${RENTAL_SIGNUP_MAX_PHOTOS_PER_VEHICLE} photos are allowed per vehicle.`,
      };
    }
    // partner_id is filled in by the caller once the partner row's id is known.
    const built = buildRentalVehicleRow(vehicle, 0);
    if (!built.ok) {
      return built;
    }
    vehicleRows.push(built.row);
  }

  return { ok: true, partnerRow: partnerBuilt.row, vehicleRows };
}

export { formatSupabaseInsertError } from "@/lib/car-submission-insert";
