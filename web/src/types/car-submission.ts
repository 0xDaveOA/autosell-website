export type CarSubmission = {
  id: number;
  car_make: string;
  car_model: string;
  year: string | number | null;
  /** Optional DB column when using CAR_SUBMISSIONS_YEAR_COLUMN for filtering */
  year_numeric?: number | null;
  price: number;
  mileage: number;
  location: string;
  package_type: string | null;
  car_condition: string | null;
  transmission?: string | null;
  fuel_type?: string | null;
  car_description: string | null;
  seller_name: string;
  seller_phone: string;
  seller_email: string | null;
  preferred_contact: string | null;
  additional_info: string | null;
  status: string;
  photos: string[] | string | null;
  photo_metadata: unknown[] | null;
  notes?: string | null;
  paystack_reference?: string | null;
  paystack_payment_status?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export function normalizePhotos(photos: CarSubmission["photos"]): string[] {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos.filter(Boolean) as string[];
  if (typeof photos === "string") {
    try {
      const parsed = JSON.parse(photos) as unknown;
      return Array.isArray(parsed) ? (parsed as string[]).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Best-effort numeric year for filtering non-standard year strings */
export function parseListingYear(year: CarSubmission["year"]): number | null {
  if (year == null) return null;
  const n = typeof year === "number" ? year : parseInt(String(year).replace(/\D/g, "").slice(0, 4), 10);
  return Number.isFinite(n) && n >= 1950 && n <= 2100 ? n : null;
}
