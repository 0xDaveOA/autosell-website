import { NextResponse } from "next/server";
import {
  buildCarSubmissionRow,
  formatSupabaseInsertError,
  SELL_FORM_MAX_PHOTOS,
} from "@/lib/car-submission-insert";
import type { CarSubmissionInsertInput } from "@/lib/car-submission-insert";
import { createServiceSupabase } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { notifyNewListing } from "@/lib/notify-email";

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
  if (Array.isArray(input.photos) && input.photos.length > SELL_FORM_MAX_PHOTOS) {
    return NextResponse.json(
      { error: `At most ${SELL_FORM_MAX_PHOTOS} photos are allowed per listing.` },
      { status: 400 }
    );
  }
  if (Array.isArray(input.photo_metadata) && input.photo_metadata.length > SELL_FORM_MAX_PHOTOS) {
    return NextResponse.json(
      { error: `At most ${SELL_FORM_MAX_PHOTOS} photos are allowed per listing.` },
      { status: 400 }
    );
  }

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

  // Attach user_id if a Supabase session exists in cookies
  let userId: string | null = null;
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    userId = user?.id ?? null;
  } catch { /* no session — anonymous submission is fine */ }

  const row = userId ? { ...built.row, user_id: userId } : built.row;
  const { data, error } = await service.from("car_submissions").insert([row]).select("id").maybeSingle();
  if (error) {
    return NextResponse.json({ error: formatSupabaseInsertError(error) }, { status: 422 });
  }

  const submissionId = data?.id;

  void notifyNewListing({
    ...(input as CarSubmissionInsertInput),
    submissionId: submissionId ?? null,
  });

  return NextResponse.json(submissionId != null ? { ok: true, submissionId } : { ok: true });
}
