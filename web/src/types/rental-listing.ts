import type { RentalPartner } from "@/types/rental-partner";

export { normalizePhotos, parseListingYear } from "@/types/car-submission";

export type RentalListing = {
  id: number;
  partner_id: number;
  car_make: string;
  car_model: string;
  year: string | number | null;
  year_numeric?: number | null;
  vehicle_category: string | null;
  transmission: string | null;
  fuel_type: string | null;
  seats: number | null;
  listing_type: "rent" | "lease" | "both";
  daily_rate: number;
  monthly_rate: number | null;
  with_driver_available: boolean;
  self_drive_available: boolean;
  location: string;
  description: string | null;
  status: string;
  notes?: string | null;
  photos: string[] | string | null;
  photo_metadata: unknown[] | null;
  featured?: boolean;
  paystack_reference?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type RentalListingWithPartner = RentalListing & {
  rental_partners: Pick<
    RentalPartner,
    "id" | "business_name" | "location" | "whatsapp_number" | "contact_phone" | "status"
  > | null;
};
