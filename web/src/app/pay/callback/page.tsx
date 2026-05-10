import Link from "next/link";

type SP = Promise<{ trxref?: string; reference?: string }>;

export default async function PayCallbackPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ref = sp.reference ?? sp.trxref;

  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center md:px-8">
      <div className="section-label justify-center">Payment</div>
      <h1 className="font-display mt-2 text-2xl font-bold text-[#1A1F2E]">Thanks — check your email</h1>
      <p className="mt-3 text-sm text-[#6B7280]">
        If your Paystack payment succeeded, your reference is saved and our team can match it to your
        listing. Reference: <span className="font-mono text-[#1A1F2E]">{ref ?? "—"}</span>
      </p>
      <p className="mt-2 text-xs text-[#9CA3AF]">
        Webhooks mark the listing as paid automatically when Paystack confirms the charge.
      </p>
      <Link
        href="/"
        className="btn-primary font-display mt-8 inline-block rounded-lg px-6 py-3 text-sm font-semibold"
      >
        Back to home
      </Link>
    </div>
  );
}
