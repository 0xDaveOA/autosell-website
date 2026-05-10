import { NextResponse } from "next/server";
import { assertAdminCookie, AdminApiAuthError } from "@/lib/admin-api-auth";
import { createServiceSupabase } from "@/lib/supabase/service";

export const runtime = "nodejs";

const ALLOWED_STATUS = new Set(["new", "contacted", "completed", "rejected", "archived"]);

type PatchBody = {
  status?: string;
  notes?: string;
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

  const status = typeof body.status === "string" ? body.status.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes : body.notes == null ? "" : String(body.notes);

  if (!ALLOWED_STATUS.has(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
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

  const { error } = await service
    .from("car_submissions")
    .update({
      status,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
