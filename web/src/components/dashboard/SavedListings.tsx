import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type SavedRow = {
  id: number;
  listing_type: "car" | "rental";
  listing_id: number;
  created_at: string;
};

interface Props {
  userId: string;
}

export async function SavedListings({ userId }: Props) {
  let saved: SavedRow[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("saved_listings")
      .select("id, listing_type, listing_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    saved = (data ?? []) as SavedRow[];
  } catch {
    // Supabase not configured
  }

  if (saved.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E2E6EA] bg-[#F9FAFB] p-10 text-center">
        <p className="text-4xl">❤️</p>
        <p className="mt-3 font-semibold text-[#1A1F2E]">No saved listings</p>
        <p className="mt-1 text-sm text-[#6B7280]">
          Tap the heart on any car or rental to save it here.
        </p>
        <Link
          href="/cars"
          className="btn-primary mt-5 inline-block rounded-lg px-6 py-2.5 text-sm font-semibold"
        >
          Browse cars
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {saved.map((row) => {
        const isCar = row.listing_type === "car";
        const href = isCar ? `/cars/${row.listing_id}` : `/rentals/${row.listing_id}`;

        return (
          <div
            key={row.id}
            className="flex items-center gap-4 rounded-xl border border-[#E2E6EA] bg-white p-4 shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0EB] text-xl">
              {isCar ? "🚗" : "🔑"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-[#1A1F2E]">
                {isCar ? "Car listing" : "Rental vehicle"} #{row.listing_id}
              </p>
              <p className="text-xs text-[#9CA3AF]">
                Saved {new Date(row.created_at).toLocaleDateString("en-GH")}
              </p>
            </div>
            <Link
              href={href}
              className="shrink-0 rounded-lg bg-[#F4F6F8] px-3 py-1.5 text-xs font-semibold text-[#374151] hover:bg-[#E8500A] hover:text-white transition-colors"
            >
              View
            </Link>
          </div>
        );
      })}
    </div>
  );
}
