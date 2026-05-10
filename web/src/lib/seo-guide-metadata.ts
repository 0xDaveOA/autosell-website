import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

/** Exact browser & sharing titles for SEO guides (avoids double suffix from root layout template). */
export function seoGuideMetadata(opts: {
  path: `/${string}`;
  title: string;
  description: string;
}): Metadata {
  const base = getSiteUrl();
  const url = `${base}${opts.path}`;
  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "AutoSell Ghana",
      locale: "en_GH",
      type: "article",
    },
  };
}
