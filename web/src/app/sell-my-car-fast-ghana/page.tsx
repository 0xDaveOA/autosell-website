import type { Metadata } from "next";
import { SeoArticleShell } from "@/components/seo/SeoArticleShell";
import { MarketingSeoSellFastBody } from "@/components/seo/marketing-seo-bodies";
import { seoGuideMetadata } from "@/lib/seo-guide-metadata";

const path = "/sell-my-car-fast-ghana";

export const metadata: Metadata = seoGuideMetadata({
  path,
  title: "Sell My Car Fast in Ghana | AutoSell.gh",
  description:
    "Want to sell your car quickly in Ghana? List on AutoSell.gh and reach thousands of buyers via website, Facebook, Instagram & WhatsApp. Free to start.",
});

export default function SellMyCarFastPage() {
  return (
    <SeoArticleShell title="How to Sell Your Car Fast in Ghana">
      <MarketingSeoSellFastBody />
    </SeoArticleShell>
  );
}
