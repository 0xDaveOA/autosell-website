"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const inputClass =
  "w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-[#1A1F2E] placeholder-[#9CA3AF] outline-none focus:border-[#E8500A] focus:ring-2 focus:ring-[#E8500A]/20 transition-all";

type ListingType = "rent" | "lease" | "both";

export default function EditFleetVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [listingType, setListingType] = useState<ListingType>("rent");
  const [dailyRate, setDailyRate] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [withDriver, setWithDriver] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabase();
      if (!supabase || !Number.isFinite(id)) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Verify the vehicle belongs to the logged-in user's partner account
      const { data: partnerData } = await supabase
        .from("rental_partners")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!partnerData) { router.push("/dashboard?tab=fleet"); return; }

      const { data } = await supabase
        .from("rental_listings")
        .select("car_make, car_model, listing_type, daily_rate, monthly_rate, location, description, with_driver_available")
        .eq("id", id)
        .eq("partner_id", partnerData.id)
        .maybeSingle();

      if (!data) { router.push("/dashboard?tab=fleet"); return; }

      setMake(data.car_make ?? "");
      setModel(data.car_model ?? "");
      setListingType((data.listing_type as ListingType) ?? "rent");
      setDailyRate(String(data.daily_rate ?? ""));
      setMonthlyRate(String(data.monthly_rate ?? ""));
      setLocation(data.location ?? "");
      setDescription(data.description ?? "");
      setWithDriver(Boolean(data.with_driver_available));
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch(`/api/user/fleet/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listing_type: listingType,
        daily_rate: listingType !== "lease" ? Number(dailyRate) : 0,
        monthly_rate: listingType !== "rent" ? Number(monthlyRate) : null,
        location,
        description,
        with_driver_available: withDriver,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Vehicle updated!" });
    } else {
      const json = await res.json().catch(() => ({}));
      setMsg({ ok: false, text: (json as { error?: string }).error ?? "Failed to save." });
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-[#6B7280]">Loading…</div>;
  }

  const pillClass = (active: boolean) =>
    `flex-1 rounded-lg py-2 text-sm font-semibold border-2 transition-all ${
      active ? "border-[#E8500A] bg-[#E8500A] text-white" : "border-[#E2E6EA] text-[#6B7280] hover:border-[#E8500A] hover:text-[#E8500A]"
    }`;

  return (
    <div className="mx-auto max-w-lg px-5 py-12">
      <Link href="/dashboard?tab=fleet" className="mb-6 inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#E8500A]">
        ← Back to dashboard
      </Link>

      <h1 className="font-display mb-6 text-2xl font-bold text-[#1A1F2E]">
        Edit vehicle — {make} {model}
      </h1>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Listing type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Listing type</label>
          <div className="flex gap-2">
            {(["rent", "lease", "both"] as ListingType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setListingType(t)}
                className={pillClass(listingType === t)}
              >
                {t === "rent" ? "Daily rent" : t === "lease" ? "Long-term lease" : "Both"}
              </button>
            ))}
          </div>
        </div>

        {/* Daily rate */}
        {listingType !== "lease" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#374151]">Daily rate (GHS)</label>
            <input
              type="number"
              min={0}
              required
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        {/* Monthly rate */}
        {listingType !== "rent" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#374151]">Monthly rate (GHS)</label>
            <input
              type="number"
              min={0}
              required
              value={monthlyRate}
              onChange={(e) => setMonthlyRate(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={withDriver}
            onChange={(e) => setWithDriver(e.target.checked)}
            className="h-4 w-4 rounded border-[#D1D5DB] text-[#E8500A] focus:ring-[#E8500A]"
          />
          <span className="text-sm font-medium text-[#374151]">Driver available</span>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full rounded-lg py-3 text-sm font-semibold disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      {msg && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
            msg.ok ? "bg-[#E8F6F1] text-[#00875a]" : "bg-[#FEE2E2] text-[#DC2626]"
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
