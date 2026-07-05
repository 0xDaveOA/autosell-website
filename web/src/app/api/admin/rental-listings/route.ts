import { NextResponse } from "next/server";
import { assertAdminCookie, AdminApiAuthError } from "@/lib/admin-api-auth";
import { createServiceSupabase } from "@/lib/supabase/service";
import {
  buildRentalVehicleRow,
  formatSupabaseInsertError,
  isAdminRentalListingStatus,
} from "@/lib/rental-partner-insert";
import type { RentalVehicleInsertInput } from "@/lib/rental-partner-insert";

export const runtime = "nodejs";

export async function GET() {
  try {
    await assertAdminCookie();
  } catch (e) {
    if (e instanceof AdminApiAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const service = createServiceSupabase();
  if (!service) {
    return NextResponse.json(
      {
        error: "NO_SERVICE_ROLE",
        message: "Add SUPABASE_SERVICE_ROLE_KEY to the server environment for admin listings.",
      },
      { status: 503 }
    );
  }

  const { data, error } = await service
    .from("rental_listings")
    .select("*, rental_partners(business_name, location, status)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }

  return NextResponse.json({ data: data ?? [] });
}

/** Admin-only create — for staff adding a vehicle to an existing partner. */
export async function POST(req: Request) {
  try {
    await assertAdminCookie();
  } catch (e) {
    if (e instanceof AdminApiAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected a JSON object." }, { status: 400 });
  }

  const input = body as Partial<RentalVehicleInsertInput> & {
    partner_id?: number;
    status?: string;
    notes?: string;
  };
  const partnerId = Number(input.partner_id);
  if (!Number.isFinite(partnerId) || partnerId < 1) {
    return NextResponse.json({ error: "A valid partner_id is required." }, { status: 400 });
  }

  const built = buildRentalVehicleRow(input as RentalVehicleInsertInput, partnerId);
  if (!built.ok) {
    return NextResponse.json({ error: built.error }, { status: 400 });
  }

  if (input.status && isAdminRentalListingStatus(input.status)) {
    built.row.status = input.status;
  }
  if (typeof input.notes === "string" && input.notes.trim()) {
    built.row.notes = input.notes.trim();
  }

  const service = createServiceSupabase();
  if (!service) {
    return NextResponse.json(
      { error: "NO_SERVICE_ROLE", message: "Add SUPABASE_SERVICE_ROLE_KEY to the server environment." },
      { status: 503 }
    );
  }

  const { data, error } = await service.from("rental_listings").insert([built.row]).select("id").maybeSingle();
  if (error) {
    return NextResponse.json({ error: formatSupabaseInsertError(error) }, { status: 422 });
  }

  return NextResponse.json({ ok: true, listingId: data?.id ?? null });
}
