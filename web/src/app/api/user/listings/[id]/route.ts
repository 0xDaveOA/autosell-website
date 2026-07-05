import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const listingId = Number(id);
  if (!Number.isFinite(listingId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { price, car_description, seller_phone } = body as {
    price?: number;
    car_description?: string;
    seller_phone?: string;
  };

  const updates: Record<string, unknown> = {};
  if (price !== undefined) {
    const n = Number(price);
    if (!Number.isFinite(n) || n < 0) return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    updates.price = n;
  }
  if (car_description !== undefined) updates.car_description = String(car_description).slice(0, 2000);
  if (seller_phone !== undefined) updates.seller_phone = String(seller_phone).slice(0, 30);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  // RLS policy ensures only the owner can update — but we double-check user_id here too
  const { error, count } = await supabase
    .from("car_submissions")
    .update(updates)
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 422 });
  if (count === 0) return NextResponse.json({ error: "Not found or not yours" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
