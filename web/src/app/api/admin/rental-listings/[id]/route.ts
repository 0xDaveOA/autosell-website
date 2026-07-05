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

type PatchBody = Partial<RentalVehicleInsertInput> & {
  partner_id?: number;
  status?: string;
  notes?: string;
  full?: boolean;
};

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminCookie();
  } catch (e) {
    if (e instanceof AdminApiAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { id: idRaw } = await ctx.params;
  const id = Number.parseInt(idRaw, 10);
  if (!Number.isFinite(id) || id < 1) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const service = createServiceSupabase();
  if (!service) {
    return NextResponse.json(
      { error: "NO_SERVICE_ROLE", message: "Add SUPABASE_SERVICE_ROLE_KEY to the server environment." },
      { status: 503 }
    );
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.full) {
    const { data: existing } = await service
      .from("rental_listings")
      .select("partner_id")
      .eq("id", id)
      .maybeSingle();
    const partnerId = Number(body.partner_id ?? existing?.partner_id);
    if (!Number.isFinite(partnerId) || partnerId < 1) {
      return NextResponse.json({ error: "A valid partner_id is required." }, { status: 400 });
    }
    const built = buildRentalVehicleRow(body as RentalVehicleInsertInput, partnerId);
    if (!built.ok) {
      return NextResponse.json({ error: built.error }, { status: 400 });
    }
    Object.assign(update, built.row);
    delete (update as { created_at?: unknown }).created_at;
  }

  const status = typeof body.status === "string" ? body.status.trim() : "";
  if (status) {
    if (!isAdminRentalListingStatus(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    update.status = status;
  } else if (!body.full) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  if (typeof body.notes === "string") {
    update.notes = body.notes;
  }

  // No Meta auto-post hook for rentals in this pass — see scheduleMetaAutoPostIfNeeded
  // in meta-social-auto-post.ts for the pattern a future pass could wire in here.

  const { error } = await service.from("rental_listings").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: formatSupabaseInsertError(error) }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
