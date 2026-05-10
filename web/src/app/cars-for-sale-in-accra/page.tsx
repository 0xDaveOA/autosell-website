import type { Metadata } from "next";
import { SeoArticleShell } from "@/components/seo/SeoArticleShell";
import { MarketingSeoAccraBody } from "@/components/seo/marketing-seo-bodies";
import { seoGuideMetadata } from "@/lib/seo-guide-metadata";

const path = "/cars-for-sale-in-accra";

export const metadata: Metadata = seoGuideMetadata({
  path,
  title: "Cars for Sale in Accra | AutoSell Ghana",
  description:
    "Browse quality cars for sale in Accra, Ghana. Connect directly with trusted sellers via WhatsApp. New listings added daily on AutoSell.gh.",
});

export default function CarsForSaleAccraPage() {
  return (
    <SeoArticleShell title="Cars for Sale in Accra, Ghana">
      <MarketingSeoAccraBody />
    </SeoArticleShell>
  );
}
