"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, Upload, Plus, Trash2, GripVertical } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { CarSubmission } from "@/types/car-submission";
import { normalizePhotos } from "@/types/car-submission";
import {
  ADMIN_LISTING_STATUSES,
  type AdminListingStatus,
} from "@/lib/car-submission-insert";
import { TRANSMISSION_OPTIONS, FUEL_TYPE_OPTIONS } from "@/lib/listing-filters";

const inputCls =
  "mt-1 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[#1A1F2E] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15";

const labelCls = "block text-xs font-semibold uppercase tracking-wide text-neutral-500";

const LOCATIONS = ["Accra", "Kumasi", "Tema", "Takoradi", "Cape Coast", "Tamale", "Other"] as const;
const CONDITIONS = ["Excellent", "Good", "Fair", "Needs work"] as const;
const PACKAGES = ["free", "premium", "complete"] as const;
const CONTACT_METHODS = ["WhatsApp", "Phone call", "Email"] as const;

function buildYearOptions(): string[] {
  const y = new Date().getFullYear();
  const list: string[] = [];
  for (let yr = y; yr >= 1990; yr--) list.push(String(yr));
  list.push("Older");
  return list;
}

export type AdminListingFormMode = { kind: "create" } | { kind: "edit"; row: CarSubmission };

export function AdminListingForm({
  mode,
  onClose,
  onSaved,
}: {
  mode: AdminListingFormMode;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = mode.kind === "edit";
  const initial = isEdit ? mode.row : null;
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoReorderFrom = useRef<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [fileDropActive, setFileDropActive] = useState(false);

  const [carMake, setCarMake] = useState(initial?.car_make ?? "");
  const [carModel, setCarModel] = useState(initial?.car_model ?? "");
  const [carYear, setCarYear] = useState(initial?.year != null ? String(initial.year) : "");
  const [carMileage, setCarMileage] = useState(initial ? String(initial.mileage) : "");
  const [carPrice, setCarPrice] = useState(initial ? String(initial.price) : "");
  const [carLocation, setCarLocation] = useState(initial?.location ?? "");
  const [carCondition, setCarCondition] = useState(initial?.car_condition ?? "");
  const [carTransmission, setCarTransmission] = useState(initial?.transmission ?? "");
  const [carFuelType, setCarFuelType] = useState(initial?.fuel_type ?? "");
  const [carDescription, setCarDescription] = useState(initial?.car_description ?? "");
  const [additionalInfo, setAdditionalInfo] = useState(initial?.additional_info ?? "");

  const [sellerName, setSellerName] = useState(initial?.seller_name ?? "");
  const [sellerPhone, setSellerPhone] = useState(initial?.seller_phone ?? "");
  const [sellerEmail, setSellerEmail] = useState(initial?.seller_email ?? "");
  const [preferredContact, setPreferredContact] = useState(initial?.preferred_contact ?? "WhatsApp");

  const [packageType, setPackageType] = useState<string>(initial?.package_type ?? "free");
  const [status, setStatus] = useState<AdminListingStatus>(
    (initial?.status as AdminListingStatus) || "completed"
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const [photos, setPhotos] = useState<string[]>(initial ? normalizePhotos(initial.photos) : []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    setUploadBusy(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      const folder = `admin-uploads/${Date.now()}`;
      for (const file of Array.from(list)) {
        if (!file.type.startsWith("image/")) continue;
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
        const path = `${folder}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("car-photos")
          .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
        if (upErr) throw new Error(upErr.message);
        const { data: pub } = supabase.storage.from("car-photos").getPublicUrl(path);
        if (pub?.publicUrl) uploaded.push(pub.publicUrl);
      }
      setPhotos((prev) => [...prev, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Photo upload failed.");
    } finally {
      setUploadBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removePhotoAt(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function reorderPhotos(from: number, to: number) {
    if (from === to || from < 0 || to < 0) return;
    setPhotos((prev) => {
      if (from >= prev.length || to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function isFileDrag(e: React.DragEvent) {
    return Array.from(e.dataTransfer.types).includes("Files");
  }

  function onPhotoDropZoneDragEnter(e: React.DragEvent) {
    if (!isFileDrag(e)) return;
    setFileDropActive(true);
  }

  function onPhotoDropZoneDragLeave(e: React.DragEvent) {
    if (!isFileDrag(e)) return;
    const related = e.relatedTarget as Node | null;
    if (related && (e.currentTarget as HTMLElement).contains(related)) return;
    setFileDropActive(false);
  }

  function onPhotoDropZoneDragOver(e: React.DragEvent) {
    if (isFileDrag(e)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }

  async function onPhotoDropZoneDrop(e: React.DragEvent) {
    setFileDropActive(false);
    if (!isFileDrag(e) || !e.dataTransfer.files?.length) return;
    e.preventDefault();
    await handleFiles(e.dataTransfer.files);
  }

  function addPhotoFromUrl() {
    const url = prompt("Paste image URL:");
    if (!url) return;
    setPhotos((prev) => (prev.includes(url) ? prev : [...prev, url.trim()]));
  }

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const body = {
        car_make: carMake,
        car_model: carModel,
        year: carYear,
        price: carPrice,
        mileage: carMileage,
        location: carLocation,
        package_type: packageType,
        car_condition: carCondition,
        transmission: carTransmission,
        fuel_type: carFuelType,
        car_description: carDescription,
        seller_name: sellerName,
        seller_phone: sellerPhone,
        seller_email: sellerEmail,
        preferred_contact: preferredContact,
        additional_info: additionalInfo,
        photos,
        status,
        notes,
        ...(isEdit ? { full: true } : {}),
      };
      const url = isEdit ? `/api/admin/submissions/${mode.row.id}` : "/api/admin/submissions";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setError(payload.error || payload.message || `Save failed (${res.status})`);
        return;
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-8">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-secondary)]">
              {isEdit ? `Edit listing #${mode.row.id}` : "Add new listing"}
            </h2>
            <p className="text-xs text-neutral-500">
              {isEdit
                ? "Update any field below. Status controls whether the car appears publicly."
                : "Create a listing directly. Set status to “Completed (live)” to publish immediately."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {error}
            </div>
          )}

          <Section title="Vehicle">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Make *" value={carMake} onChange={setCarMake} placeholder="Toyota" />
              <Field label="Model *" value={carModel} onChange={setCarModel} placeholder="Corolla" />
              <SelectField label="Year *" value={carYear} onChange={setCarYear} options={buildYearOptions()} />
              <Field
                label="Mileage (km) *"
                value={carMileage}
                onChange={setCarMileage}
                placeholder="120000"
                type="number"
              />
              <Field
                label="Price (₵) *"
                value={carPrice}
                onChange={setCarPrice}
                placeholder="85000"
                type="number"
              />
              <SelectField label="Location *" value={carLocation} onChange={setCarLocation} options={[...LOCATIONS]} />
              <SelectField label="Condition *" value={carCondition} onChange={setCarCondition} options={[...CONDITIONS]} />
              <SelectField label="Transmission *" value={carTransmission} onChange={setCarTransmission} options={[...TRANSMISSION_OPTIONS]} />
              <SelectField label="Fuel type *" value={carFuelType} onChange={setCarFuelType} options={[...FUEL_TYPE_OPTIONS]} />
            </div>
            <div className="mt-4">
              <label className={labelCls}>Description *</label>
              <textarea
                value={carDescription}
                onChange={(e) => setCarDescription(e.target.value)}
                rows={3}
                className={inputCls}
                placeholder="Single owner, full service history, accident-free…"
              />
            </div>
            <div className="mt-4">
              <label className={labelCls}>Additional info</label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={2}
                className={inputCls}
                placeholder="Optional extras"
              />
            </div>
          </Section>

          <Section title="Photos">
            <p className="mb-3 text-xs leading-relaxed text-neutral-500">
              <strong className="text-neutral-700">Drag thumbnails</strong> to change order — the first photo is the
              main image on the site. <strong className="text-neutral-700">Drop image files</strong> anywhere in the
              box below to upload (same as choosing files).
            </p>
            <div
              className={`rounded-xl border-2 border-dashed p-3 transition-colors ${
                fileDropActive
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-[var(--color-border)] bg-neutral-50/40"
              }`}
              onDragEnter={onPhotoDropZoneDragEnter}
              onDragLeave={onPhotoDropZoneDragLeave}
              onDragOver={onPhotoDropZoneDragOver}
              onDrop={onPhotoDropZoneDrop}
            >
              <div className="flex flex-wrap gap-3">
                {photos.length === 0 && (
                  <p className="text-sm text-neutral-500">No photos yet. Upload, drop files here, or add a URL.</p>
                )}
                {photos.map((u, index) => (
                  <div
                    key={`${u}__${index}`}
                    draggable
                    onDragStart={(e) => {
                      if (isFileDrag(e)) {
                        e.preventDefault();
                        return;
                      }
                      photoReorderFrom.current = index;
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", "reorder");
                    }}
                    onDragEnd={() => {
                      photoReorderFrom.current = null;
                    }}
                    onDragOver={(e) => {
                      if (isFileDrag(e)) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "copy";
                        return;
                      }
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFileDropActive(false);
                      if (e.dataTransfer.files?.length) {
                        void handleFiles(e.dataTransfer.files);
                        return;
                      }
                      const from = photoReorderFrom.current;
                      photoReorderFrom.current = null;
                      if (from == null) return;
                      reorderPhotos(from, index);
                    }}
                    className="group relative h-24 w-24 cursor-grab overflow-hidden rounded-lg border border-neutral-200 active:cursor-grabbing"
                  >
                    <Image src={u} alt="" fill className="pointer-events-none object-cover" unoptimized />
                    <div
                      className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-0.5 bg-black/45 py-0.5 text-white"
                      aria-hidden
                    >
                      <GripVertical className="h-3.5 w-3.5 opacity-90" />
                      <span className="text-[10px] font-semibold tabular-nums">{index + 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhotoAt(index)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-100 shadow-sm md:opacity-0 md:transition-opacity md:group-hover:opacity-100"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-secondary)] hover:bg-neutral-50">
                  <Upload className="h-3.5 w-3.5" />
                  {uploadBusy ? "Uploading…" : "Upload from device"}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => void handleFiles(e.target.files)}
                  />
                </label>
                <button
                  type="button"
                  onClick={addPhotoFromUrl}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-secondary)] hover:bg-neutral-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add by URL
                </button>
              </div>
            </div>
          </Section>

          <Section title="Seller">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name *" value={sellerName} onChange={setSellerName} />
              <Field label="Phone *" value={sellerPhone} onChange={setSellerPhone} placeholder="0240…" />
              <Field label="Email" value={sellerEmail} onChange={setSellerEmail} type="email" />
              <SelectField
                label="Preferred contact *"
                value={preferredContact}
                onChange={setPreferredContact}
                options={[...CONTACT_METHODS]}
              />
            </div>
          </Section>

          <Section title="Listing controls">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Package *"
                value={packageType}
                onChange={setPackageType}
                options={[...PACKAGES]}
              />
              <SelectField
                label="Status *"
                value={status}
                onChange={(v) => setStatus(v as AdminListingStatus)}
                options={[...ADMIN_LISTING_STATUSES]}
              />
            </div>
            <div className="mt-4">
              <label className={labelCls}>Admin notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={inputCls}
                placeholder="Internal only — not shown publicly"
              />
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              Tip: choose <b>completed</b> to publish on the public site immediately.
            </p>
          </Section>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 rounded-b-2xl border-t bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="rounded-xl bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-secondary)]">{title}</h3>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        <option value="">— select —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
