"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CarSubmission } from "@/types/car-submission";
import { normalizePhotos } from "@/types/car-submission";
import { LogOut, Plus, RefreshCw } from "lucide-react";
import { AdminListingForm, type AdminListingFormMode } from "@/components/admin/AdminListingForm";

export function AdminDashboard() {
  const [rows, setRows] = useState<CarSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [modalId, setModalId] = useState<number | null>(null);
  const [modalStatus, setModalStatus] = useState("new");
  const [modalNotes, setModalNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [hideRejected, setHideRejected] = useState(true);
  const [formMode, setFormMode] = useState<AdminListingFormMode | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setConfigError(null);
    try {
      const res = await fetch("/api/admin/submissions", { credentials: "same-origin" });
      const payload = (await res.json().catch(() => ({}))) as {
        data?: CarSubmission[];
        error?: string;
        message?: string;
      };
      if (res.status === 503 && payload.error === "NO_SERVICE_ROLE") {
        setConfigError(
          payload.message ??
            "Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the dev server."
        );
        setRows([]);
        return;
      }
      if (!res.ok) {
        setConfigError(payload.error || payload.message || `Load failed (${res.status})`);
        setRows([]);
        return;
      }
      setRows(payload.data ?? []);
    } catch {
      setConfigError("Could not load submissions.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = rows.filter((r) => {
    if (hideRejected && statusFilter !== "rejected" && r.status === "rejected") return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.car_make.toLowerCase().includes(q) ||
      r.car_model.toLowerCase().includes(q) ||
      r.seller_name.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: rows.length,
    new: rows.filter((r) => r.status === "new").length,
    contacted: rows.filter((r) => r.status === "contacted").length,
    completed: rows.filter((r) => r.status === "completed").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    archived: rows.filter((r) => r.status === "archived").length,
  };

  function openModal(r: CarSubmission) {
    setModalId(r.id);
    setModalStatus(r.status);
    setModalNotes(r.notes ?? "");
  }

  async function saveModal() {
    if (modalId == null) return;
    setSaving(true);
    const res = await fetch(`/api/admin/submissions/${modalId}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: modalStatus, notes: modalNotes }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    setSaving(false);
    if (!res.ok) {
      alert(payload.error || payload.message || `Save failed (${res.status})`);
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.id === modalId
          ? { ...r, status: modalStatus, notes: modalNotes, updated_at: new Date().toISOString() }
          : r
      )
    );
    setModalId(null);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-[var(--color-muted)] pb-16">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-secondary)]">Admin</h1>
            <p className="text-xs text-neutral-500">Car submissions</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/rentals" className="text-sm text-neutral-600 hover:text-[var(--color-primary)]">
              Rentals
            </Link>
            <Link href="/" className="text-sm text-neutral-600 hover:text-[var(--color-primary)]">
              View site
            </Link>
            <button
              type="button"
              onClick={() => setFormMode({ kind: "create" })}
              className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95"
            >
              <Plus className="h-4 w-4" />
              Add listing
            </button>
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
          <div
            className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="alert"
          >
            {configError}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            ["Total", stats.total],
            ["New", stats.new],
            ["Contacted", stats.contacted],
            ["Live", stats.completed],
            ["Rejected", stats.rejected],
            ["Archived", stats.archived],
          ].map(([l, n]) => (
            <div key={l} className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{l}</div>
              <div className="mt-1 text-2xl font-bold text-[var(--color-secondary)]">{n}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm md:flex-row md:flex-wrap md:items-end">
          <div className="flex min-w-[200px] items-center gap-2">
            <input
              id="hide-rejected"
              type="checkbox"
              checked={hideRejected}
              onChange={(e) => setHideRejected(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)]"
            />
            <label htmlFor="hide-rejected" className="text-sm text-neutral-700">
              Hide rejected from table
            </label>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-neutral-500">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Make, model, seller, location"
              className="mt-1 w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm md:w-44"
            >
              <option value="">All</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="completed">Completed (live)</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-neutral-500">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-neutral-500">No rows.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)] bg-neutral-50 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Car</th>
                  <th className="px-3 py-3">Seller</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">Photos</th>
                  <th className="px-3 py-3">Payment</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const pics = normalizePhotos(r.photos);
                  return (
                    <tr key={r.id} className="border-b border-neutral-100">
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-neutral-600">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="max-w-[200px] px-3 py-3">
                        <div className="font-semibold text-[var(--color-secondary)]">
                          {r.car_make} {r.car_model}
                        </div>
                        <div className="text-xs text-neutral-500">{r.location}</div>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <div className="font-medium">{r.seller_name}</div>
                        <div>{r.seller_phone}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-semibold text-[var(--color-primary)]">
                        ₵{r.price.toLocaleString()}
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
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-neutral-600">
                        {(r.paystack_payment_status ?? "—").toString() || "—"}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => openModal(r)}
                            className="rounded-lg bg-[var(--color-secondary)] px-2 py-1 text-xs font-semibold text-white hover:bg-[#002438]"
                          >
                            Status
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormMode({ kind: "edit", row: r })}
                            className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs font-semibold text-[var(--color-secondary)] hover:bg-neutral-50"
                          >
                            Edit details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {formMode && (
        <AdminListingForm
          mode={formMode}
          onClose={() => setFormMode(null)}
          onSaved={() => {
            setFormMode(null);
            void load();
          }}
        />
      )}

      {modalId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[var(--color-secondary)]">Update status</h3>
            <label className="mt-4 block text-sm font-medium">Status</label>
            <select
              value={modalStatus}
              onChange={(e) => setModalStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="completed">Completed (live)</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
            <label className="mt-4 block text-sm font-medium">Notes</label>
            <textarea
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalId(null)}
                className="rounded-xl border px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveModal()}
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
