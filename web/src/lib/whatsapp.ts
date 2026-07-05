export function whatsappE164(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? "233505677556";
}

export function waLink(text: string): string {
  return `https://wa.me/${whatsappE164()}?text=${encodeURIComponent(text)}`;
}

/** Buyer enquiry for a published listing — always routes to business WhatsApp (`NEXT_PUBLIC_WHATSAPP_E164`). */
export function listingEnquiryWaLink(opts: {
  id: number;
  title: string;
  price: number;
  location: string;
  siteUrl: string;
}): string {
  const base = opts.siteUrl.replace(/\/$/, "");
  const url = `${base}/cars/${opts.id}`;
  const priceStr = `₵${opts.price.toLocaleString("en-GH")}`;
  const loc = opts.location.trim() ? ` · ${opts.location.trim()}` : "";
  const msg = `Hi AutoSell Ghana! I'm interested in listing #${opts.id}: ${opts.title} (${priceStr}${loc}). ${url}`;
  return waLink(msg);
}

/**
 * Renter enquiry for a rental listing — routes to the PARTNER's own WhatsApp
 * number (rentals are partner-operated, not AutoSell-brokered), falling back
 * to AutoSell's number only if the partner has neither whatsapp_number nor
 * contact_phone populated.
 */
export function rentalEnquiryWaLink(opts: {
  id: number;
  title: string;
  dailyRate?: number | null;
  monthlyRate?: number | null;
  listingType?: "rent" | "lease" | "both";
  location: string;
  siteUrl: string;
  partnerWhatsapp?: string | null;
}): string {
  const base = opts.siteUrl.replace(/\/$/, "");
  const url = `${base}/rentals/${opts.id}`;
  const type = opts.listingType ?? "rent";
  const parts: string[] = [];
  if ((type === "rent" || type === "both") && opts.dailyRate) {
    parts.push(`₵${opts.dailyRate.toLocaleString("en-GH")}/day`);
  }
  if ((type === "lease" || type === "both") && opts.monthlyRate) {
    parts.push(`₵${opts.monthlyRate.toLocaleString("en-GH")}/month`);
  }
  const rateStr = parts.length ? parts.join(" · ") : "";
  const loc = opts.location.trim() ? ` · ${opts.location.trim()}` : "";
  const verb = type === "lease" ? "leasing" : "renting";
  const msg = `Hi! I'm interested in ${verb} #${opts.id}: ${opts.title}${rateStr ? ` (${rateStr})` : ""}${loc}. ${url}`;
  const number = opts.partnerWhatsapp?.trim();
  if (number) {
    return `https://wa.me/${number.replace(/[^\d]/g, "")}?text=${encodeURIComponent(msg)}`;
  }
  return waLink(msg);
}
