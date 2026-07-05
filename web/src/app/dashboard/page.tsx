import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard — AutoSell Ghana",
  description: "Manage your listings, fleet, and saved cars.",
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { tab: rawTab } = await searchParams;
  const tab = rawTab === "fleet" || rawTab === "saved" ? rawTab : "cars";

  return <DashboardShell user={user} tab={tab} />;
}
