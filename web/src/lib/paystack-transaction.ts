import { createServiceSupabase } from "@/lib/supabase/service";

type VerifyResponse = {
  status?: boolean;
  message?: string;
  data?: {
    status?: string;
    reference?: string;
    metadata?: { submission_id?: number | string; submissionId?: number | string };
  };
};

export type PaystackVerifyResult =
  | { ok: true; status: "paid" | "pending" | "failed"; submissionId?: number }
  | { ok: false; error: string };

/** Verify a Paystack reference and sync `paystack_payment_status` when successful. */
export async function verifyAndSyncPaystackReference(
  reference: string,
  secret: string
): Promise<PaystackVerifyResult> {
  const ref = reference.trim();
  if (!ref) return { ok: false, error: "Missing reference." };

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as VerifyResponse;
  if (!res.ok || !json.status) {
    return { ok: false, error: json.message || "Verification failed." };
  }

  const txStatus = json.data?.status ?? "unknown";
  const meta = json.data?.metadata;
  const sidRaw = meta?.submission_id ?? meta?.submissionId;
  const submissionId =
    typeof sidRaw === "number" ? sidRaw : Number.parseInt(String(sidRaw ?? ""), 10);

  if (txStatus === "success") {
    const service = createServiceSupabase();
    if (service && Number.isFinite(submissionId) && submissionId > 0) {
      await service
        .from("car_submissions")
        .update({
          paystack_reference: json.data?.reference ?? ref,
          paystack_payment_status: "paid",
        })
        .eq("id", submissionId);
    } else if (service) {
      await service
        .from("car_submissions")
        .update({
          paystack_reference: ref,
          paystack_payment_status: "paid",
        })
        .eq("paystack_reference", ref);
    }
    return { ok: true, status: "paid", submissionId: Number.isFinite(submissionId) ? submissionId : undefined };
  }

  if (txStatus === "failed" || txStatus === "abandoned") {
    return { ok: true, status: "failed", submissionId: Number.isFinite(submissionId) ? submissionId : undefined };
  }

  return { ok: true, status: "pending", submissionId: Number.isFinite(submissionId) ? submissionId : undefined };
}
