import { NextResponse } from "next/server";
import { assertAdminCookie, AdminApiAuthError } from "@/lib/admin-api-auth";
import { createServiceSupabase } from "@/lib/supabase/service";
import { isMetaAutoPostConfigured } from "@/lib/meta-social-config";
import { runRentalMetaAutoPost } from "@/lib/meta-social-rental-auto-post";

export const runtime = "nodejs";
/** Meta Graph (FB + IG) can take several seconds. */
export const maxDuration = 60;

/** Manually (re)post a rental vehicle to Facebook/Instagram from the admin dashboard. */
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

  // runRentalMetaAutoPost self-validates active status + partner approval
  const result = await runRentalMetaAutoPost(service, id);

  if (result.skipped === "not-active") {
    return NextResponse.json(
      { error: "Vehicle is not active — set it to active first." },
      { status: 409 }
    );
  }
  if (result.skipped === "partner-not-approved") {
    return NextResponse.json(
      { error: "The partner is not approved yet — approve them first." },
      { status: 409 }
    );
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
