/** Best-effort Ghana/local phone → WhatsApp `wa.me` number (digits only, no leading +). Returns null if unparseable. */
export function phoneToWaE164(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (!d) return null;
  // Already has country code
  if (d.startsWith("233")) {
    if (d.length < 11) return null;
    return d;
  }
  // Local Ghana mobile often 0XXXXXXXXX (10 digits) or shorter without country code
  if (d.startsWith("0") && d.length >= 10) return `233${d.slice(1)}`;
  // Nine digits starting with usual mobile prefixes (missing leading 0)
  if (d.length === 9 && /^[2345]/.test(d)) return `233${d}`;
  if (d.length === 10 && /^[2345]/.test(d)) return `233${d}`;
  return null;
}

export function sellerWaHref(phoneRaw: string, message: string): string | null {
  const e164 = phoneToWaE164(phoneRaw);
  if (!e164) return null;
  return `https://wa.me/${e164}?text=${encodeURIComponent(message)}`;
}

export function sellerTelHref(phoneRaw: string): string | null {
  const e164 = phoneToWaE164(phoneRaw);
  if (e164) return `tel:+${e164}`;
  const d = phoneRaw.replace(/\D/g, "");
  if (d.length >= 7) return `tel:${d}`;
  return null;
}
