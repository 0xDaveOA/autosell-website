import { NextResponse } from "next/server";
import { buildCarSubmissionRow, formatSupabaseInsertError } from "@/lib/car-submission-insert";
import type { CarSubmissionInsertInput } from "@/lib/car-submission-insert";
import { createServiceSupabase } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected a JSON object." }, { status: 400 });
  }

  const input = body as Partial<CarSubmissionInsertInput>;
  const built = buildCarSubmissionRow(input as CarSubmissionInsertInput);
  if (!built.ok) {
    return NextResponse.json({ error: built.error }, { status: 400 });
  }

  const service = createServiceSupabase();
  if (!service) {
    return NextResponse.json(
      {
        error: "NO_SERVICE_ROLE",
        message:
          "Listing submissions are not enabled on the server. Add SUPABASE_SERVICE_ROLE_KEY to your deployment environment.",
      },
      { status: 503 }
    );
  }

  const { data, error } = await service.from("car_submissions").insert([built.row]).select("id").maybeSingle();
  if (error) {
    return NextResponse.json({ error: formatSupabaseInsertError(error) }, { status: 422 });
  }

  const submissionId = data?.id;
  return NextResponse.json(submissionId != null ? { ok: true, submissionId } : { ok: true });
}
