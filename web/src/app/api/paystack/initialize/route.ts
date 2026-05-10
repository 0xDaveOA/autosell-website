import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/service";
import { getSiteUrl } from "@/lib/site-url";
import { paystackAmountForPackage, pesewasFromGhs } from "@/lib/paystack-config";

export const runtime = "nodejs";

type Body = {
  submissionId?: number;
  packageType?: string;
  email?: string;
};

function paystackSecret(): string | null {
  const s = process.env.PAYSTACK_SECRET_KEY?.trim();
  return s || null;
}

export async function POST(req: Request) {
  const secret = paystackSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "NO_PAYSTACK", message: "Paystack is not configured (PAYSTACK_SECRET_KEY)." },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const submissionId = Number(body.submissionId);
  if (!Number.isFinite(submissionId) || submissionId < 1) {
    return NextResponse.json({ error: "Invalid submissionId." }, { status: 400 });
  }

  const packageType = typeof body.packageType === "string" ? body.packageType.trim() : "";
  const ghs = paystackAmountForPackage(packageType);
  if (ghs == null) {
    return NextResponse.json({ error: "This package does not require online payment." }, { status: 400 });
  }

  const service = createServiceSupabase();
  if (!service) {
    return NextResponse.json(
      { error: "NO_SERVICE_ROLE", message: "Server database access is not configured." },
      { status: 503 }
    );
  }

  const { data: row, error: loadErr } = await service
    .from("car_submissions")
    .select("id, package_type, paystack_payment_status, seller_email")
    .eq("id", submissionId)
    .maybeSingle();

  if (loadErr || !row) {
    return NextResponse.json({ error: "Listing submission not found." }, { status: 404 });
  }

  if (String(row.package_type) !== packageType) {
    return NextResponse.json({ error: "Package does not match this submission." }, { status: 400 });
  }

  if (row.paystack_payment_status === "paid") {
    return NextResponse.json({ error: "This listing is already marked as paid." }, { status: 409 });
  }

  const emailRaw =
    typeof body.email === "string" && body.email.includes("@")
      ? body.email.trim()
      : String(row.seller_email ?? "").trim();

  if (!emailRaw || !emailRaw.includes("@")) {
    return NextResponse.json(
      {
        error: "EMAIL_REQUIRED",
        message: "Provide a valid customer email for the Paystack receipt (add it on the sell form or pass `email`).",
      },
      { status: 400 }
    );
  }

  const amount = pesewasFromGhs(ghs);
  const reference = `autosell-${submissionId}-${Date.now()}`;
  const base = getSiteUrl();

  const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: emailRaw,
      amount,
      currency: "GHS",
      reference,
      callback_url: `${base}/pay/callback`,
      metadata: {
        submission_id: submissionId,
        package_type: packageType,
      },
    }),
  });

  const initJson = (await initRes.json().catch(() => ({}))) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string; reference?: string };
  };

  if (!initRes.ok || !initJson.status || !initJson.data?.authorization_url) {
    return NextResponse.json(
      { error: initJson.message || "Paystack initialize failed." },
      { status: 422 }
    );
  }

  await service
    .from("car_submissions")
    .update({
      paystack_reference: initJson.data.reference ?? reference,
      paystack_payment_status: "pending",
    })
    .eq("id", submissionId);

  return NextResponse.json({
    authorization_url: initJson.data.authorization_url,
    reference: initJson.data.reference ?? reference,
  });
}
