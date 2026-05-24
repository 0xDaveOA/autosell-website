/** Client-safe package prices (GHS) — keep in sync with server `PAYSTACK_*_AMOUNT_GHS`. */
export function getPublicPaystackAmounts(): { premium: number; complete: number } {
  const premium = Number.parseFloat(process.env.NEXT_PUBLIC_PAYSTACK_PREMIUM_AMOUNT_GHS ?? "50");
  const complete = Number.parseFloat(process.env.NEXT_PUBLIC_PAYSTACK_COMPLETE_AMOUNT_GHS ?? "200");
  return {
    premium: Number.isFinite(premium) && premium > 0 ? premium : 50,
    complete: Number.isFinite(complete) && complete > 0 ? complete : 200,
  };
}

export function isPaystackEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PAYSTACK_ENABLED === "true";
}
