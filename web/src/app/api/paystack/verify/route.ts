import { NextResponse } from "next/server";
import { verifyAndSyncPaystackReference } from "@/lib/paystack-transaction";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "NO_PAYSTACK", message: "Paystack is not configured." },
      { status: 503 }
    );
  }

  const ref = new URL(req.url).searchParams.get("reference")?.trim();
  if (!ref) {
    return NextResponse.json({ error: "reference query param required." }, { status: 400 });
  }

  const result = await verifyAndSyncPaystackReference(ref, secret);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({
    ok: true,
    status: result.status,
    submissionId: result.submissionId,
  });
}
