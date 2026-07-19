import { NextResponse } from "next/server";
import { after } from "next/server";
import { assertAdminCookie, AdminApiAuthError } from "@/lib/admin-api-auth";
import { createServiceSupabase } from "@/lib/supabase/service";
import {
  buildCarSubmissionRow,
  formatSupabaseInsertError,
  isAdminListingStatus,
} from "@/lib/car-submission-insert";
import type { CarSubmissionInsertInput } from "@/lib/car-submission-insert";
import { scheduleMetaAutoPostIfNeeded } from "@/lib/meta-social-auto-post";
import { notifySellerStatusChange } from "@/lib/notify-seller-email";

export const runtime = "nodejs";
/** Meta Graph (FB + IG) can take several seconds after admin save. */
export const maxDuration = 60;

type PatchBody = Partial<CarSubmissionInsertInput> & {
  status?: string;
  notes?: string;
  /** When true, treat body as full listing edit (validate all required fields). */
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
      {
        error: "NO_SERVICE_ROLE",
        message: "Add SUPABASE_SERVICE_ROLE_KEY to the server environment for admin updates.",
      },
      { status: 503 }
    );
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.full) {
    const built = buildCarSubmissionRow(body as CarSubmissionInsertInput);
    if (!built.ok) {
      return NextResponse.json({ error: built.error }, { status: 400 });
    }
    Object.assign(update, built.row);
    delete (update as { created_at?: unknown }).created_at;
  }

  const status = typeof body.status === "string" ? body.status.trim() : "";
  if (status) {
    if (!isAdminListingStatus(status)) {
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
    .from("car_submissions")
    .select("status, seller_email, seller_name, car_make, car_model, price")
    .eq("id", id)
    .maybeSingle();

  const { error } = await service.from("car_submissions").update(update).eq("id", id);

  if (error) {
    return NextResponse.json({ error: formatSupabaseInsertError(error) }, { status: 422 });
  }

  const newStatus =
    typeof update.status === "string" ? update.status : String(prevRow?.status ?? "");
  scheduleMetaAutoPostIfNeeded(service, id, {
    previousStatus: prevRow?.status ?? null,
    newStatus,
  });

  // Email the seller when their listing is published or rejected (only on an actual change)
  if (prevRow && newStatus !== prevRow.status) {
    after(() =>
      notifySellerStatusChange({
        submissionId: id,
        sellerEmail: prevRow.seller_email,
        sellerName: prevRow.seller_name,
        title: `${prevRow.car_make ?? ""} ${prevRow.car_model ?? ""}`.trim() || "car",
        price: prevRow.price,
        newStatus,
      })
    );
  }

  return NextResponse.json({ ok: true });
}
