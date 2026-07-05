"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

interface Props {
  listingType: "car" | "rental";
  listingId: number;
}

export function SaveButton({ listingType, listingId }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const supabase = createBrowserSupabase();
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);
    if (saved) {
      await fetch(
        `/api/user/saved-listings?listing_type=${listingType}&listing_id=${listingId}`,
        { method: "DELETE" }
      );
      setSaved(false);
    } else {
      await fetch("/api/user/saved-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_type: listingType, listing_id: listingId }),
      });
      setSaved(true);
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      title={saved ? "Remove from saved" : "Save to dashboard"}
      className="absolute right-3 bottom-3 z-[6] flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/5 transition-transform hover:scale-110 disabled:opacity-50"
    >
      <svg
        className={`h-4 w-4 transition-colors ${saved ? "fill-[#E8500A] text-[#E8500A]" : "fill-none text-[#6B7280]"}`}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
        />
      </svg>
    </button>
  );
}
