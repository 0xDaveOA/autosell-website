import { NextResponse } from "next/server";
import { assertAdminCookie, AdminApiAuthError } from "@/lib/admin-api-auth";
import { createServiceSupabase } from "@/lib/supabase/service";
import {
  buildRentalPartnerRow,
  formatSupabaseInsertError,
  isAdminPartnerStatus,
} from "@/lib/rental-partner-insert";
import type { RentalPartnerInsertInput } from "@/lib/rental-partner-insert";
import { schedulePartnerApprovalMetaPosts } from "@/lib/meta-social-rental-auto-post";

export const runtime = "nodejs";
/** Meta Graph (FB + IG) can take several seconds after admin save. */
export const maxDuration = 60;

type PatchBody = Partial<RentalPartnerInsertInput> & {
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
    const built = buildRentalPartnerRow(body as RentalPartnerInsertInput);
    if (!built.ok) {
      return NextResponse.json({ error: built.error }, { status: 400 });
    }
    Object.assign(update, built.row);
    delete (update as { created_at?: unknown }).created_at;
  }

  const status = typeof body.status === "string" ? body.status.trim() : "";
  if (status) {
    if (!isAdminPartnerStatus(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    update.status = status;
  } else if (!body.full) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  if (typeof body.notes === "string") {
    update.notes = body.notes;
  }

  const { data: prevRow } = await service
    .from("rental_partners")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  const { error } = await service.from("rental_partners").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: formatSupabaseInsertError(error) }, { status: 422 });
  }

  // Approving a partner makes their active vehicles publicly visible — auto-post up to 3
  const newStatus =
    typeof update.status === "string" ? update.status : String(prevRow?.status ?? "");
  schedulePartnerApprovalMetaPosts(service, id, {
    previousStatus: prevRow?.status ?? null,
    newStatus,
  });

  return NextResponse.json({ ok: true });
}
