import type { Metadata } from "next";
import { SeoArticleShell } from "@/components/seo/SeoArticleShell";
import { MarketingSeoDealersBody } from "@/components/seo/marketing-seo-bodies";
import { seoGuideMetadata } from "@/lib/seo-guide-metadata";

const path = "/car-dealers-ghana";

export const metadata: Metadata = seoGuideMetadata({
  path,
  title: "Car Dealers & Garages in Ghana | List on AutoSell.gh",
  description:
    "Are you a car dealer or garage in Ghana? Partner with AutoSell.gh to reach more buyers online. List your full inventory. Free and premium plans available.",
});

export default function CarDealersGhanaPage() {
  return (
    <SeoArticleShell title="Car Dealers and Garages in Ghana — Grow Your Business with AutoSell">
      <MarketingSeoDealersBody />
    </SeoArticleShell>
  );
}
