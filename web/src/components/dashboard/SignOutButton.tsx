"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createBrowserSupabase();
    if (supabase) await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-lg border border-[#E2E6EA] px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:border-[#E8500A] hover:text-[#E8500A]"
    >
      Sign out
    </button>
  );
}
