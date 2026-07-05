import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { fetchPublishedListingIdsForSitemap } from "@/lib/listings";
import { fetchActiveRentalListingIdsForSitemap } from "@/lib/rental-listings";
import { SEO_GUIDE_NAV } from "@/lib/seo-guide-paths";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const seoGuides: MetadataRoute.Sitemap = SEO_GUIDE_NAV.map((g) => ({
    url: `${base}${g.href}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/cars`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sell`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/rentals`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/rent-with-us`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/flights`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/hotels`, changeFrequency: "weekly", priority: 0.8 },
    ...seoGuides,
  ];

  const ids = await fetchPublishedListingIdsForSitemap();
  const listings: MetadataRoute.Sitemap = ids.map((id) => ({
    url: `${base}/cars/${id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const rentalIds = await fetchActiveRentalListingIdsForSitemap();
  const rentals: MetadataRoute.Sitemap = rentalIds.map((id) => ({
    url: `${base}/rentals/${id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...listings, ...rentals];
}
