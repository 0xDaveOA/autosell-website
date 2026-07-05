import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { listing_type, listing_id } = body as { listing_type?: string; listing_id?: number };
  if (!listing_type || !listing_id) {
    return NextResponse.json({ error: "listing_type and listing_id are required" }, { status: 400 });
  }
  if (listing_type !== "car" && listing_type !== "rental") {
    return NextResponse.json({ error: "listing_type must be car or rental" }, { status: 400 });
  }

  const { error } = await supabase
    .from("saved_listings")
    .insert([{ user_id: user.id, listing_type, listing_id }]);

  if (error) {
    // Unique constraint — already saved, return ok
    if (error.code === "23505") return NextResponse.json({ ok: true, already: true });
    return NextResponse.json({ error: error.message }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const listing_type = searchParams.get("listing_type");
  const listing_id = Number(searchParams.get("listing_id"));

  if (!listing_type || !Number.isFinite(listing_id)) {
    return NextResponse.json({ error: "listing_type and listing_id are required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("saved_listings")
    .delete()
    .eq("user_id", user.id)
    .eq("listing_type", listing_type)
    .eq("listing_id", listing_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 422 });
  return NextResponse.json({ ok: true });
}
