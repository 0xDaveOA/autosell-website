import type { Metadata } from "next";
import { SeoArticleShell } from "@/components/seo/SeoArticleShell";
import { MarketingSeoRentalPartnersBody } from "@/components/seo/marketing-seo-bodies";
import { seoGuideMetadata } from "@/lib/seo-guide-metadata";

const path = "/car-rental-ghana";

export const metadata: Metadata = seoGuideMetadata({
  path,
  title: "Car Rental Partners in Ghana | List on AutoSell.gh",
  description:
    "Run a car rental business in Ghana? Partner with AutoSell.gh to reach renters online. List your fleet for free.",
});

export default function CarRentalGhanaPage() {
  return (
    <SeoArticleShell title="Car Rental Partners in Ghana — Grow Your Fleet's Reach">
      <MarketingSeoRentalPartnersBody />
    </SeoArticleShell>
  );
}
