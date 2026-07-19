import { NextResponse } from "next/server";
import { assertAdminCookie, AdminApiAuthError } from "@/lib/admin-api-auth";
import { createServiceSupabase } from "@/lib/supabase/service";
import { isMetaAutoPostConfigured } from "@/lib/meta-social-config";
import { runMetaAutoPost } from "@/lib/meta-social-auto-post";
import { getListingStatuses } from "@/lib/listings";

export const runtime = "nodejs";
/** Meta Graph (FB + IG) can take several seconds. */
export const maxDuration = 60;

/** Manually (re)post a car listing to Facebook/Instagram from the admin dashboard. */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
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

  if (!isMetaAutoPostConfigured()) {
    return NextResponse.json({ error: "Meta auto-post is not configured." }, { status: 409 });
  }

  const service = createServiceSupabase();
  if (!service) {
    return NextResponse.json(
      { error: "NO_SERVICE_ROLE", message: "Add SUPABASE_SERVICE_ROLE_KEY to the server environment." },
      { status: 503 }
    );
  }

  // Only post listings that are publicly visible — otherwise the FB link 404s
  const { data: row } = await service
    .from("car_submissions")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (!row) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  if (!getListingStatuses().includes(String(row.status).trim())) {
    return NextResponse.json(
      { error: "Listing is not published — set it to completed first." },
      { status: 409 }
    );
  }

  const result = await runMetaAutoPost(service, id);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
