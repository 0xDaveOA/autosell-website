/** Canonical site origin (no trailing slash). Used for sitemap, OG, Paystack callbacks. */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://autosellgh.com").replace(/\/$/, "");
}
