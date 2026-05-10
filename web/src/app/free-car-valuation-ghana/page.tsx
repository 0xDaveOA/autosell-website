import type { Metadata } from "next";
import { SeoArticleShell } from "@/components/seo/SeoArticleShell";
import { MarketingSeoValuationBody } from "@/components/seo/marketing-seo-bodies";
import { seoGuideMetadata } from "@/lib/seo-guide-metadata";

const path = "/free-car-valuation-ghana";

export const metadata: Metadata = seoGuideMetadata({
  path,
  title: "Free Car Valuation in Ghana | What Is My Car Worth?",
  description:
    "Get a FREE car valuation for your vehicle in Ghana. Find out the right market price before you sell. Fast, free, and no obligation. AutoSell.gh.",
});

export default function FreeCarValuationGhanaPage() {
  return (
    <SeoArticleShell title="Free Car Valuation — Find Out What Your Car Is Worth in Ghana">
      <MarketingSeoValuationBody />
    </SeoArticleShell>
  );
}
