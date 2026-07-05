import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { SignOutButton } from "./SignOutButton";
import { MyListings } from "./MyListings";
import { MyFleet } from "./MyFleet";
import { SavedListings } from "./SavedListings";

type Tab = "cars" | "fleet" | "saved";

interface Props {
  user: User;
  tab: Tab;
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "cars", label: "My Cars", icon: "🚗" },
  { id: "fleet", label: "My Fleet", icon: "🏢" },
  { id: "saved", label: "Saved", icon: "❤️" },
];

export function DashboardShell({ user, tab }: Props) {
  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email ??
    user.phone ??
    "My Account";

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8500A] text-base font-bold text-white">
          {initials}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-[#1A1F2E]">{displayName}</h1>
          <p className="text-sm text-[#6B7280]">{user.email ?? user.phone}</p>
        </div>
        <SignOutButton />
      </div>

      {/* Tab navigation */}
      <div className="mb-6 flex gap-1 rounded-xl border border-[#E2E6EA] bg-[#F4F6F8] p-1">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/dashboard?tab=${t.id}`}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-white text-[#E8500A] shadow-sm"
                : "text-[#6B7280] hover:text-[#1A1F2E]"
            }`}
          >
            <span aria-hidden>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </Link>
        ))}
      </div>

      {/* Tab content */}
      {tab === "cars" && <MyListings userId={user.id} />}
      {tab === "fleet" && <MyFleet userId={user.id} />}
      {tab === "saved" && <SavedListings userId={user.id} />}
    </div>
  );
}
