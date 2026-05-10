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
