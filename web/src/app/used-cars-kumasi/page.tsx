import type { Metadata } from "next";
import { SeoArticleShell } from "@/components/seo/SeoArticleShell";
import { MarketingSeoKumasiBody } from "@/components/seo/marketing-seo-bodies";
import { seoGuideMetadata } from "@/lib/seo-guide-metadata";

const path = "/used-cars-kumasi";

export const metadata: Metadata = seoGuideMetadata({
  path,
  title: "Used Cars for Sale in Kumasi | AutoSell Ghana",
  description:
    "Find affordable used cars for sale in Kumasi, Ghana. Browse listings from trusted sellers in Kumasi and Ashanti Region. Contact via WhatsApp on AutoSell.gh.",
});

export default function UsedCarsKumasiPage() {
  return (
    <SeoArticleShell title="Used Cars for Sale in Kumasi">
      <MarketingSeoKumasiBody />
    </SeoArticleShell>
  );
}
