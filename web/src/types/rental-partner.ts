export type RentalPartner = {
  id: number;
  business_name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  whatsapp_number: string | null;
  location: string;
  business_description: string | null;
  status: string;
  notes?: string | null;
  subscription_tier?: string | null;
  subscription_status?: string | null;
  paystack_customer_code?: string | null;
  created_at: string;
  updated_at?: string | null;
};
