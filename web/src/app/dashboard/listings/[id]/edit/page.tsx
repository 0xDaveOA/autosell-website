"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const inputClass =
  "w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-[#1A1F2E] placeholder-[#9CA3AF] outline-none focus:border-[#E8500A] focus:ring-2 focus:ring-[#E8500A]/20 transition-all";

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabase();
      if (!supabase || !Number.isFinite(id)) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase
        .from("car_submissions")
        .select("car_make, car_model, year, price, car_description, seller_phone, user_id")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!data) { router.push("/dashboard"); return; }
      setMake(data.car_make ?? "");
      setModel(data.car_model ?? "");
      setYear(String(data.year ?? ""));
      setPrice(String(data.price ?? ""));
      setDescription(data.car_description ?? "");
      setSellerPhone(data.seller_phone ?? "");
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch(`/api/user/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: Number(price),
        car_description: description,
        seller_phone: sellerPhone,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Changes saved!" });
    } else {
      const json = await res.json().catch(() => ({}));
      setMsg({ ok: false, text: (json as { error?: string }).error ?? "Failed to save." });
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-[#6B7280]">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-12">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#E8500A]">
        ← Back to dashboard
      </Link>

      <h1 className="font-display mb-6 text-2xl font-bold text-[#1A1F2E]">
        Edit listing — {make} {model} {year}
      </h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Price (GHS)</label>
          <input
            type="number"
            required
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Contact phone</label>
          <input
            type="tel"
            value={sellerPhone}
            onChange={(e) => setSellerPhone(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Description</label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </div>

        <p className="text-xs text-[#9CA3AF]">
          Make, model, year, and listing status can only be changed by AutoSell staff.
        </p>

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
