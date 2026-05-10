import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/service";
import { verifyPaystackSignature } from "@/lib/paystack-verify";

export const runtime = "nodejs";

function paystackSecret(): string | null {
  const s = process.env.PAYSTACK_SECRET_KEY?.trim();
  return s || null;
}

type PaystackHook = {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    metadata?: { submission_id?: string | number; submissionId?: string | number };
  };
};

export async function POST(req: Request) {
  const secret = paystackSecret();
  if (!secret) {
    return NextResponse.json({ error: "no secret" }, { status: 503 });
  }

  const raw = await req.text();
  const sig = req.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(raw, sig, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let payload: PaystackHook;
  try {
    payload = JSON.parse(raw) as PaystackHook;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (payload.event !== "charge.success") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const ref = payload.data?.reference;
  const meta = payload.data?.metadata;
  const sidRaw = meta?.submission_id ?? meta?.submissionId;
  const sid = typeof sidRaw === "number" ? sidRaw : Number.parseInt(String(sidRaw ?? ""), 10);

  if (!ref || !Number.isFinite(sid) || sid < 1) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const service = createServiceSupabase();
  if (!service) {
    return NextResponse.json({ error: "no service" }, { status: 503 });
  }

  const { error } = await service
    .from("car_submissions")
    .update({
      paystack_reference: ref,
      paystack_payment_status: "paid",
    })
    .eq("id", sid);

  if (error) {
    console.error("paystack webhook update", error);
    return NextResponse.json({ error: error.message }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
