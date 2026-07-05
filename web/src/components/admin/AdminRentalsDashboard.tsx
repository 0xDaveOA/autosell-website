"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, RefreshCw } from "lucide-react";
import type { RentalPartner } from "@/types/rental-partner";
import type { RentalListingWithPartner } from "@/types/rental-listing";
import { normalizePhotos } from "@/types/rental-listing";

type Tab = "partners" | "listings";

export function AdminRentalsDashboard() {
  const [tab, setTab] = useState<Tab>("partners");
  const [partners, setPartners] = useState<RentalPartner[]>([]);
  const [listings, setListings] = useState<RentalListingWithPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  const [partnerModalId, setPartnerModalId] = useState<number | null>(null);
  const [partnerModalStatus, setPartnerModalStatus] = useState("pending");
  const [partnerModalNotes, setPartnerModalNotes] = useState("");

  const [listingModalId, setListingModalId] = useState<number | null>(null);
  const [listingModalStatus, setListingModalStatus] = useState("pending");
  const [listingModalNotes, setListingModalNotes] = useState("");

  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setConfigError(null);
    try {
      const [partnersRes, listingsRes] = await Promise.all([
        fetch("/api/admin/rental-partners", { credentials: "same-origin" }),
        fetch("/api/admin/rental-listings", { credentials: "same-origin" }),
      ]);
      const partnersPayload = (await partnersRes.json().catch(() => ({}))) as {
        data?: RentalPartner[];
        error?: string;
        message?: string;
      };
      const listingsPayload = (await listingsRes.json().catch(() => ({}))) as {
        data?: RentalListingWithPartner[];
        error?: string;
        message?: string;
      };

      if (partnersRes.status === 503 && partnersPayload.error === "NO_SERVICE_ROLE") {
        setConfigError(
          partnersPayload.message ?? "Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the dev server."
        );
        setPartners([]);
        setListings([]);
        return;
      }
      if (!partnersRes.ok || !listingsRes.ok) {
        setConfigError(
          partnersPayload.error ||
            partnersPayload.message ||
            listingsPayload.error ||
            listingsPayload.message ||
            `Load failed`
        );
        return;
      }
      setPartners(partnersPayload.data ?? []);
      setListings(listingsPayload.data ?? []);
    } catch {
      setConfigError("Could not load rentals data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function partnerName(id: number): string {
    return partners.find((p) => p.id === id)?.business_name ?? `Partner #${id}`;
  }

  function openPartnerModal(p: RentalPartner) {
    setPartnerModalId(p.id);
    setPartnerModalStatus(p.status);
    setPartnerModalNotes(p.notes ?? "");
  }

  async function savePartnerModal() {
    if (partnerModalId == null) return;
    setSaving(true);
    const res = await fetch(`/api/admin/rental-partners/${partnerModalId}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: partnerModalStatus, notes: partnerModalNotes }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    setSaving(false);
    if (!res.ok) {
      alert(payload.error || payload.message || `Save failed (${res.status})`);
      return;
    }
    setPartners((prev) =>
      prev.map((p) => (p.id === partnerModalId ? { ...p, status: partnerModalStatus, notes: partnerModalNotes } : p))
    );
    setPartnerModalId(null);
  }

  function openListingModal(l: RentalListingWithPartner) {
    setListingModalId(l.id);
    setListingModalStatus(l.status);
    setListingModalNotes(l.notes ?? "");
  }

  async function saveListingModal() {
    if (listingModalId == null) return;
    setSaving(true);
    const res = await fetch(`/api/admin/rental-listings/${listingModalId}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: listingModalStatus, notes: listingModalNotes }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    setSaving(false);
    if (!res.ok) {
      alert(payload.error || payload.message || `Save failed (${res.status})`);
      return;
    }
    setListings((prev) =>
      prev.map((l) => (l.id === listingModalId ? { ...l, status: listingModalStatus, notes: listingModalNotes } : l))
    );
    setListingModalId(null);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const partnerStats = {
    total: partners.length,
    pending: partners.filter((p) => p.status === "pending").length,
    approved: partners.filter((p) => p.status === "approved").length,
    rejected: partners.filter((p) => p.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-[var(--color-muted)] pb-16">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-secondary)]">Admin — Rentals</h1>
            <p className="text-xs text-neutral-500">
              Approving a partner does not auto-activate their vehicles — manage each vehicle&apos;s status
              independently.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-sm text-neutral-600 hover:text-[var(--color-primary)]">
              Car listings
            </Link>
            <Link href="/" className="text-sm text-neutral-600 hover:text-[var(--color-primary)]">
              View site
            </Link>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
        {configError && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="alert">
            {configError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Partners", partnerStats.total],
            ["Pending", partnerStats.pending],
            ["Approved", partnerStats.approved],
            ["Rejected", partnerStats.rejected],
          ].map(([l, n]) => (
            <div key={l} className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{l}</div>
              <div className="mt-1 text-2xl font-bold text-[var(--color-secondary)]">{n}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("partners")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === "partners" ? "bg-[var(--color-primary)] text-white" : "border border-[var(--color-border)] bg-white text-[var(--color-secondary)]"}`}
          >
            Partners
          </button>
          <button
            type="button"
            onClick={() => setTab("listings")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === "listings" ? "bg-[var(--color-primary)] text-white" : "border border-[var(--color-border)] bg-white text-[var(--color-secondary)]"}`}
          >
            Listings
          </button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-neutral-500">Loading…</p>
          ) : tab === "partners" ? (
            partners.length === 0 ? (
              <p className="p-8 text-center text-neutral-500">No partners yet.</p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--color-border)] bg-neutral-50 text-xs uppercase text-neutral-500">
                  <tr>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Business</th>
                    <th className="px-3 py-3">Contact</th>
                    <th className="px-3 py-3">Location</th>
                    <th className="px-3 py-3">Vehicles</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-100">
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-neutral-600">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                      <td className="max-w-[200px] px-3 py-3 font-semibold text-[var(--color-secondary)]">
                        {p.business_name}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <div className="font-medium">{p.contact_name}</div>
                        <div>{p.contact_phone}</div>
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-600">{p.location}</td>
                      <td className="px-3 py-3 text-xs text-neutral-600">
                        {listings.filter((l) => l.partner_id === p.id).length}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => openPartnerModal(p)}
                          className="rounded-lg bg-[var(--color-secondary)] px-2 py-1 text-xs font-semibold text-white hover:bg-[#002438]"
                        >
                          Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : listings.length === 0 ? (
            <p className="p-8 text-center text-neutral-500">No vehicles yet.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)] bg-neutral-50 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Vehicle</th>
                  <th className="px-3 py-3">Partner</th>
                  <th className="px-3 py-3">Daily rate</th>
                  <th className="px-3 py-3">Photos</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => {
                  const pics = normalizePhotos(l.photos);
                  return (
                    <tr key={l.id} className="border-b border-neutral-100">
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-neutral-600">
                        {new Date(l.created_at).toLocaleString()}
                      </td>
                      <td className="max-w-[200px] px-3 py-3">
                        <div className="font-semibold text-[var(--color-secondary)]">
                          {l.car_make} {l.car_model}
                        </div>
                        <div className="text-xs text-neutral-500">{l.location}</div>
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-600">
                        {l.rental_partners?.business_name ?? partnerName(l.partner_id)}
                        {l.rental_partners?.status !== "approved" ? (
                          <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                            partner {l.rental_partners?.status ?? "unknown"}
                          </span>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-semibold text-[var(--color-primary)]">
                        ₵{l.daily_rate.toLocaleString()}/day
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          {pics.slice(0, 3).map((u) => (
                            <a
                              key={u}
                              href={u}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative h-10 w-10 overflow-hidden rounded border"
                            >
                              <Image src={u} alt="" fill className="object-cover" unoptimized />
                            </a>
                          ))}
                          {pics.length === 0 && <span className="text-xs text-neutral-400">—</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize">
                          {l.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => openListingModal(l)}
                          className="rounded-lg bg-[var(--color-secondary)] px-2 py-1 text-xs font-semibold text-white hover:bg-[#002438]"
                        >
                          Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {partnerModalId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[var(--color-secondary)]">
              Update partner status — {partnerName(partnerModalId)}
            </h3>
            <label className="mt-4 block text-sm font-medium">Status</label>
            <select
              value={partnerModalStatus}
              onChange={(e) => setPartnerModalStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <label className="mt-4 block text-sm font-medium">Notes</label>
            <textarea
              value={partnerModalNotes}
              onChange={(e) => setPartnerModalNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setPartnerModalId(null)} className="rounded-xl border px-4 py-2 text-sm font-medium">
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void savePartnerModal()}
                className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {listingModalId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[var(--color-secondary)]">Update vehicle status</h3>
            <label className="mt-4 block text-sm font-medium">Status</label>
            <select
              value={listingModalStatus}
              onChange={(e) => setListingModalStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="active">Active (live)</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
            <label className="mt-4 block text-sm font-medium">Notes</label>
            <textarea
              value={listingModalNotes}
              onChange={(e) => setListingModalNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setListingModalId(null)} className="rounded-xl border px-4 py-2 text-sm font-medium">
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveListingModal()}
                className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
