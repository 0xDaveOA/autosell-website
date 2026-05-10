import { SellWizard } from "@/components/sell/SellWizard";

export const metadata = {
  title: "Sell your car",
  description:
    "List your vehicle with AutoSell Ghana — guided steps, photo uploads, and submission for team review.",
};

type SP = Promise<{ package?: string }>;

export default async function SellPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const p = sp.package;
  const initialPackage =
    p === "free" || p === "premium" || p === "complete" ? p : "";
  return <SellWizard initialPackage={initialPackage} />;
}
