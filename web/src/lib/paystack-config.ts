/** GHS totals for paid packages — amounts in Ghana cedis before ×100 pesewas. */
export function paystackAmountForPackage(packageType: string): number | null {
  const p = packageType.trim();
  if (p === "premium") {
    const n = Number.parseFloat(process.env.PAYSTACK_PREMIUM_AMOUNT_GHS ?? "50");
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  if (p === "complete") {
    const n = Number.parseFloat(process.env.PAYSTACK_COMPLETE_AMOUNT_GHS ?? "200");
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

export function pesewasFromGhs(ghs: number): number {
  return Math.round(ghs * 100);
}
