import { NextResponse } from "next/server";
import { assertAdminCookie, AdminApiAuthError } from "@/lib/admin-api-auth";
import { createServiceSupabase } from "@/lib/supabase/service";
import {
  buildCarSubmissionRow,
  formatSupabaseInsertError,
  isAdminListingStatus,
} from "@/lib/car-submission-insert";
import type { CarSubmissionInsertInput } from "@/lib/car-submission-insert";
import { scheduleMetaAutoPostIfNeeded } from "@/lib/meta-social-auto-post";

export const runtime = "nodejs";
export const maxDuration = 60;

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
    .from("car_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }

  return NextResponse.json({ data: data ?? [] });
}

/** Admin-only create — used by the "Add listing" button on the dashboard. */
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

  const input = body as Partial<CarSubmissionInsertInput> & { status?: string; notes?: string };
  const built = buildCarSubmissionRow(input as CarSubmissionInsertInput);
  if (!built.ok) {
    return NextResponse.json({ error: built.error }, { status: 400 });
  }

  if (input.status && isAdminListingStatus(input.status)) {
    built.row.status = input.status;
  }
  if (typeof input.notes === "string" && input.notes.trim()) {
    built.row.notes = input.notes.trim();
  }

  const service = createServiceSupabase();
  if (!service) {
    return NextResponse.json(
      {
        error: "NO_SERVICE_ROLE",
        message: "Add SUPABASE_SERVICE_ROLE_KEY to the server environment.",
      },
      { status: 503 }
    );
  }

  const { data, error } = await service
    .from("car_submissions")
    .insert([built.row])
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: formatSupabaseInsertError(error) }, { status: 422 });
  }

  const submissionId = data?.id;
  if (submissionId != null) {
    const newStatus = String(built.row.status ?? "new");
    scheduleMetaAutoPostIfNeeded(service, submissionId, {
      previousStatus: null,
      newStatus,
    });
  }

  return NextResponse.json({ ok: true, submissionId: submissionId ?? null });
}
