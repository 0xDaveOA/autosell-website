import type { Metadata } from "next";
import { SeoArticleShell } from "@/components/seo/SeoArticleShell";
import { MarketingSeoToyotaBody } from "@/components/seo/marketing-seo-bodies";
import { seoGuideMetadata } from "@/lib/seo-guide-metadata";

const path = "/buy-toyota-ghana";

export const metadata: Metadata = seoGuideMetadata({
  path,
  title: "Toyota Cars for Sale in Ghana | AutoSell.gh",
  description:
    "Browse Toyota cars for sale in Ghana — Corolla, Camry, RAV4, Fortuner and more. Buy directly from trusted sellers. Contact via WhatsApp on AutoSell.gh.",
});

export default function BuyToyotaGhanaPage() {
  return (
    <SeoArticleShell title="Toyota Cars for Sale in Ghana">
      <MarketingSeoToyotaBody />
    </SeoArticleShell>
  );
}
