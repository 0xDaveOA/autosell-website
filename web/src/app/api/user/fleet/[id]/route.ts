import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const vehicleId = Number(id);
  if (!Number.isFinite(vehicleId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify the vehicle belongs to the user's partner account
  const { data: partnerData } = await supabase
    .from("rental_partners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!partnerData) {
    return NextResponse.json({ error: "No partner account found" }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { listing_type, daily_rate, monthly_rate, location, description, with_driver_available } =
    body as {
      listing_type?: string;
      daily_rate?: number;
      monthly_rate?: number | null;
      location?: string;
      description?: string;
      with_driver_available?: boolean;
    };

  const VALID_TYPES = ["rent", "lease", "both"];
  if (listing_type && !VALID_TYPES.includes(listing_type)) {
    return NextResponse.json({ error: "Invalid listing_type" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (listing_type !== undefined) updates.listing_type = listing_type;
  if (daily_rate !== undefined) updates.daily_rate = Number(daily_rate);
  if (monthly_rate !== undefined) updates.monthly_rate = monthly_rate;
  if (location !== undefined) updates.location = String(location).slice(0, 200);
  if (description !== undefined) updates.description = String(description).slice(0, 2000);
  if (with_driver_available !== undefined) updates.with_driver_available = Boolean(with_driver_available);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("rental_listings")
    .update(updates)
    .eq("id", vehicleId)
    .eq("partner_id", partnerData.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 422 });

  return NextResponse.json({ ok: true });
}
