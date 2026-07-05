import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { CarSubmission } from "@/types/car-submission";

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-[#E8F6F1] text-[#00875a]",
  new: "bg-[#FFF7ED] text-[#D97706]",
  contacted: "bg-[#EFF6FF] text-[#2563EB]",
  rejected: "bg-[#FEF2F2] text-[#DC2626]",
  archived: "bg-[#F4F6F8] text-[#6B7280]",
};

function statusLabel(s: string) {
  const map: Record<string, string> = {
    new: "Pending review",
    contacted: "In review",
    completed: "Published",
    rejected: "Rejected",
    archived: "Archived",
  };
  return map[s] ?? s;
}

interface Props {
  userId: string;
}

export async function MyListings({ userId }: Props) {
  let listings: CarSubmission[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("car_submissions")
      .select("id, car_make, car_model, year, price, status, created_at, location")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    listings = (data ?? []) as CarSubmission[];
  } catch {
    // Supabase not configured
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E2E6EA] bg-[#F9FAFB] p-10 text-center">
        <p className="text-4xl">🚗</p>
        <p className="mt-3 font-semibold text-[#1A1F2E]">No listings yet</p>
        <p className="mt-1 text-sm text-[#6B7280]">
          When you submit a car for sale, it will appear here so you can track its status.
        </p>
        <Link
          href="/sell"
          className="btn-primary mt-5 inline-block rounded-lg px-6 py-2.5 text-sm font-semibold"
        >
          List a car
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {listings.map((car) => (
        <div
          key={car.id}
          className="flex flex-wrap items-center gap-4 rounded-xl border border-[#E2E6EA] bg-white p-4 shadow-sm"
        >
          <div className="flex-1">
            <p className="font-display font-bold text-[#1A1F2E]">
              {car.car_make} {car.car_model}
              {car.year ? ` (${car.year})` : ""}
            </p>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              ₵{Number(car.price).toLocaleString("en-GH")} · {car.location}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[car.status] ?? "bg-[#F4F6F8] text-[#6B7280]"}`}
          >
            {statusLabel(car.status)}
          </span>

          <Link
            href={`/dashboard/listings/${car.id}/edit`}
            className="shrink-0 rounded-lg border border-[#E8500A] px-4 py-1.5 text-sm font-semibold text-[#E8500A] transition-colors hover:bg-[#E8500A] hover:text-white"
          >
            Edit
          </Link>
        </div>
      ))}
    </div>
  );
}
