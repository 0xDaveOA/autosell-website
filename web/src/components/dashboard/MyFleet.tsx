import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { RentalPartner } from "@/types/rental-partner";
import type { RentalListing } from "@/types/rental-listing";

const PARTNER_STATUS_COLORS: Record<string, string> = {
  approved: "bg-[#E8F6F1] text-[#00875a]",
  pending: "bg-[#FFF7ED] text-[#D97706]",
  rejected: "bg-[#FEF2F2] text-[#DC2626]",
  suspended: "bg-[#F4F6F8] text-[#6B7280]",
};

const VEHICLE_STATUS_COLORS: Record<string, string> = {
  active: "bg-[#E8F6F1] text-[#00875a]",
  pending: "bg-[#FFF7ED] text-[#D97706]",
  inactive: "bg-[#F4F6F8] text-[#6B7280]",
};

interface Props {
  userId: string;
}

export async function MyFleet({ userId }: Props) {
  let partner: RentalPartner | null = null;
  let vehicles: RentalListing[] = [];

  try {
    const supabase = await createClient();

    const { data: partnerData } = await supabase
      .from("rental_partners")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    partner = partnerData as RentalPartner | null;

    if (partner) {
      const { data: vehicleData } = await supabase
        .from("rental_listings")
        .select("id, car_make, car_model, year, daily_rate, monthly_rate, listing_type, status, location")
        .eq("partner_id", partner.id)
        .order("created_at", { ascending: false });
      vehicles = (vehicleData ?? []) as RentalListing[];
    }
  } catch {
    // Supabase not configured
  }

  if (!partner) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E2E6EA] bg-[#F9FAFB] p-10 text-center">
        <p className="text-4xl">🏢</p>
        <p className="mt-3 font-semibold text-[#1A1F2E]">No fleet account yet</p>
        <p className="mt-1 text-sm text-[#6B7280]">
          Register as a rental partner to list your vehicles and manage your fleet here.
        </p>
        <Link
          href="/rent-with-us"
          className="btn-primary mt-5 inline-block rounded-lg px-6 py-2.5 text-sm font-semibold"
        >
          Register as partner
        </Link>
      </div>
    );
  }

  function formatRate(v: RentalListing) {
    const parts: string[] = [];
    if (v.listing_type !== "lease" && v.daily_rate > 0)
      parts.push(`₵${v.daily_rate.toLocaleString("en-GH")}/day`);
    if (v.listing_type !== "rent" && v.monthly_rate)
      parts.push(`₵${v.monthly_rate.toLocaleString("en-GH")}/mo`);
    return parts.join(" · ") || "—";
  }

  return (
    <div className="space-y-6">
      {/* Partner info */}
      <div className="rounded-xl border border-[#E2E6EA] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <p className="font-display font-bold text-[#1A1F2E]">{partner.business_name}</p>
            <p className="text-sm text-[#6B7280]">{partner.location}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${PARTNER_STATUS_COLORS[partner.status] ?? "bg-[#F4F6F8] text-[#6B7280]"}`}
          >
            {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
          </span>
        </div>
        {partner.status === "pending" && (
          <p className="mt-3 text-sm text-[#D97706]">
            Your partner application is being reviewed. We&apos;ll contact you shortly.
          </p>
        )}
      </div>

      {/* Vehicles */}
      <div>
        <h2 className="font-display mb-3 text-base font-bold text-[#1A1F2E]">
          Fleet ({vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""})
        </h2>

        {vehicles.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No vehicles listed yet.</p>
        ) : (
          <div className="space-y-3">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-[#E2E6EA] bg-white p-4 shadow-sm"
              >
                <div className="flex-1">
                  <p className="font-display font-bold text-[#1A1F2E]">
                    {v.car_make} {v.car_model}
                    {v.year ? ` (${v.year})` : ""}
                  </p>
                  <p className="mt-0.5 text-sm text-[#6B7280]">
                    {formatRate(v)} · {v.location}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${VEHICLE_STATUS_COLORS[v.status] ?? "bg-[#F4F6F8] text-[#6B7280]"}`}
                >
                  {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                </span>

                <Link
                  href={`/dashboard/fleet/${v.id}/edit`}
                  className="shrink-0 rounded-lg border border-[#E8500A] px-4 py-1.5 text-sm font-semibold text-[#E8500A] transition-colors hover:bg-[#E8500A] hover:text-white"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
