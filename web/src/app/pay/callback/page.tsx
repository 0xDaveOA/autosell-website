import Link from "next/link";
import { verifyAndSyncPaystackReference } from "@/lib/paystack-transaction";
import { waLink } from "@/lib/whatsapp";

type SP = Promise<{ trxref?: string; reference?: string }>;

export default async function PayCallbackPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ref = (sp.reference ?? sp.trxref)?.trim();

  let paymentState: "paid" | "pending" | "failed" | "unknown" = "unknown";
  let verifyError: string | null = null;

  if (ref) {
    const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
    if (secret) {
      const result = await verifyAndSyncPaystackReference(ref, secret);
      if (result.ok) paymentState = result.status;
      else verifyError = result.error;
    }
  }

  const waHref = waLink(
    `Hi AutoSell, I just paid for my listing on Paystack. Reference: ${ref ?? "unknown"}. Please confirm my listing.`
  );

  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center md:px-8">
      <div className="section-label justify-center">Payment</div>

      {paymentState === "paid" ? (
        <>
          <h1 className="font-display mt-2 text-2xl font-bold text-[#1A1F2E]">Payment received</h1>
          <p className="mt-3 text-sm text-[#6B7280]">
            Thank you — Paystack confirmed your payment. We&apos;ll review your listing and publish it when ready.
          </p>
        </>
      ) : paymentState === "failed" ? (
        <>
          <h1 className="font-display mt-2 text-2xl font-bold text-[#1A1F2E]">Payment not completed</h1>
          <p className="mt-3 text-sm text-[#6B7280]">
            This payment was not successful. You can try again from the sell form or contact us on WhatsApp.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-display mt-2 text-2xl font-bold text-[#1A1F2E]">Thanks — we&apos;re confirming</h1>
          <p className="mt-3 text-sm text-[#6B7280]">
            If Paystack charged you, your receipt email is on its way. We&apos;ll match this reference to your listing
            shortly.
          </p>
        </>
      )}

      <p className="mt-3 text-sm text-[#6B7280]">
        Reference: <span className="font-mono text-[#1A1F2E]">{ref ?? "—"}</span>
      </p>
      {verifyError ? <p className="mt-2 text-xs text-amber-700">{verifyError}</p> : null}

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp font-display inline-block rounded-lg px-6 py-3 text-sm font-semibold"
        >
          WhatsApp AutoSell
        </a>
        <Link
          href="/"
          className="btn-outline font-display inline-block rounded-lg px-6 py-3 text-sm font-semibold"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
