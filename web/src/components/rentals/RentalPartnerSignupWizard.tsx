"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  RENTAL_SIGNUP_MAX_PHOTOS_PER_VEHICLE,
  RENTAL_SIGNUP_MAX_VEHICLES,
} from "@/lib/rental-partner-insert";
import type { RentalPartnerInsertInput, RentalVehicleInsertInput } from "@/lib/rental-partner-insert";
import { ChevronLeft, ChevronRight, Upload, Check, X, Plus, Trash2 } from "lucide-react";
import { waLink } from "@/lib/whatsapp";
import { TRANSMISSION_OPTIONS, FUEL_TYPE_OPTIONS } from "@/lib/listing-filters";

const VEHICLE_CATEGORIES = ["Saloon", "SUV", "Pickup", "Van", "Luxury", "Other"] as const;
const LOCATIONS = ["Accra", "Kumasi", "Tema", "Takoradi", "Cape Coast", "Tamale", "Other"] as const;

function buildYearOptions(): string[] {
  const y = new Date().getFullYear();
  const list: string[] = [];
  for (let yr = y; yr >= 1990; yr--) list.push(String(yr));
  return list;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-[#E2E6EA] bg-white px-3 py-2.5 text-sm text-[#1A1F2E] outline-none transition-colors focus:border-[#E8500A] focus:ring-2 focus:ring-[#E8500A]/15";

const selectClass = inputClass;

type Step = 0 | 1 | 2 | 3;

type ListingType = "rent" | "lease" | "both";

type VehicleDraft = {
  carMake: string;
  carModel: string;
  year: string;
  vehicleCategory: string;
  transmission: string;
  fuelType: string;
  seats: string;
  listingType: ListingType;
  dailyRate: string;
  monthlyRate: string;
  withDriver: boolean;
  selfDrive: boolean;
  location: string;
  description: string;
  files: File[];
};

function emptyVehicle(defaultLocation: string): VehicleDraft {
  return {
    carMake: "",
    carModel: "",
    year: "",
    vehicleCategory: "",
    transmission: "",
    fuelType: "",
    seats: "",
    listingType: "rent",
    dailyRate: "",
    monthlyRate: "",
    withDriver: false,
    selfDrive: true,
    location: defaultLocation,
    description: "",
    files: [],
  };
}

export function RentalPartnerSignupWizard() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ vehicleCount: number } | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");

  const [vehicles, setVehicles] = useState<VehicleDraft[]>([emptyVehicle("")]);
  const [agree, setAgree] = useState(false);

  function updateVehicle(idx: number, patch: Partial<VehicleDraft>) {
    setVehicles((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  }

  function addVehicle() {
    if (vehicles.length >= RENTAL_SIGNUP_MAX_VEHICLES) {
      setError(`At most ${RENTAL_SIGNUP_MAX_VEHICLES} vehicles are allowed per signup.`);
      return;
    }
    setVehicles((prev) => [...prev, emptyVehicle(businessLocation)]);
  }

  function removeVehicle(idx: number) {
    setVehicles((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  }

  function handleVehiclePhotoChange(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) {
      updateVehicle(idx, { files: [] });
      return;
    }
    if (picked.length > RENTAL_SIGNUP_MAX_PHOTOS_PER_VEHICLE) {
      setError(
        `Please choose at most ${RENTAL_SIGNUP_MAX_PHOTOS_PER_VEHICLE} photos per vehicle (${picked.length} selected).`
      );
      return;
    }
    updateVehicle(idx, { files: picked });
  }

  function next() {
    setError(null);
    if (step === 0) {
      if (!businessName.trim() || !contactName.trim() || !contactPhone.trim() || !businessLocation) {
        setError("Please complete all required business fields.");
        return;
      }
    }
    if (step === 1) {
      for (const v of vehicles) {
        if (!v.carMake.trim() || !v.carModel.trim() || !v.year || !v.location) {
          setError("Please complete all required fields for each vehicle.");
          return;
        }
        if ((v.listingType === "rent" || v.listingType === "both") && !v.dailyRate) {
          setError("Enter a daily rate for each vehicle listed for daily rental.");
          return;
        }
        if ((v.listingType === "lease" || v.listingType === "both") && !v.monthlyRate) {
          setError("Enter a monthly rate for each vehicle listed for long-term lease.");
          return;
        }
      }
    }
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  }

  function back() {
    setError(null);
    setStep((s) => (s > 0 ? ((s - 1) as Step) : s));
  }

  async function uploadVehiclePhotos(
    vehicle: VehicleDraft,
    tempId: string,
    vehicleIndex: number
  ): Promise<{ urls: string[]; metadata: object[] }> {
    if (!supabase) throw new Error("Supabase is not configured");
    const urls: string[] = [];
    const metadata: object[] = [];
    const errors: string[] = [];

    const toUpload = vehicle.files.slice(0, RENTAL_SIGNUP_MAX_PHOTOS_PER_VEHICLE);
    for (const file of toUpload) {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: not an image file`);
        continue;
      }
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).slice(2, 15);
      const safeBase = (file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120) || "photo").replace(/^\./, "photo");
      const fileName = `rentals/${tempId}/${vehicleIndex}_${timestamp}_${randomId}_${safeBase}`;

      const { error: upErr } = await supabase.storage.from("car-photos").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) {
        errors.push(`${file.name}: ${upErr.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage.from("car-photos").getPublicUrl(fileName);
      if (urlData?.publicUrl) {
        urls.push(urlData.publicUrl);
        metadata.push({
          url: urlData.publicUrl,
          filename: fileName,
          originalName: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        });
      }
    }

    if (toUpload.length > 0 && urls.length === 0 && errors.length > 0) {
      throw new Error(`Photo upload failed: ${errors[0]}${errors.length > 1 ? ` (+${errors.length - 1} more)` : ""}.`);
    }

    return { urls, metadata };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agree) {
      setError("Please agree to the terms to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const tempId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const vehiclePayloads: RentalVehicleInsertInput[] = [];

      for (let i = 0; i < vehicles.length; i++) {
        const v = vehicles[i];
        let photoUrls: string[] = [];
        let photoMetadata: object[] = [];
        if (v.files.length > 0) {
          const up = await uploadVehiclePhotos(v, tempId, i);
          photoUrls = up.urls;
          photoMetadata = up.metadata;
        }
        vehiclePayloads.push({
          car_make: v.carMake,
          car_model: v.carModel,
          year: v.year,
          vehicle_category: v.vehicleCategory,
          transmission: v.transmission,
          fuel_type: v.fuelType,
          seats: v.seats,
          listing_type: v.listingType,
          daily_rate: v.dailyRate || "0",
          monthly_rate: v.monthlyRate || undefined,
          with_driver_available: v.withDriver,
          self_drive_available: v.selfDrive,
          location: v.location,
          description: v.description,
          photos: photoUrls.length ? photoUrls : null,
          photo_metadata: photoMetadata.length ? photoMetadata : null,
        });
      }

      const partnerPayload: RentalPartnerInsertInput = {
        business_name: businessName,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        whatsapp_number: whatsappNumber,
        location: businessLocation,
        business_description: businessDescription,
      };

      const res = await fetch("/api/rental-partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner: partnerPayload, vehicles: vehiclePayloads }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        if (res.status === 503 && data.error === "NO_SERVICE_ROLE") {
          throw new Error(data.message || "Rental signups are not enabled on the server yet.");
        }
        throw new Error(data.error || data.message || `Submit failed (${res.status})`);
      }

      setSubmitted({ vehicleCount: vehiclePayloads.length });
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const steps = ["Business", "Fleet", "Review", "Submit"];

  if (!supabase) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center md:px-8">
        <div className="section-label justify-center">Setup</div>
        <h1 className="font-display text-2xl font-bold text-[#1A1F2E]">Configuration needed</h1>
        <p className="mt-3 text-sm text-[#6B7280]">
          Add <code className="rounded bg-[#F4F6F8] px-1.5 py-0.5 text-[#1A1F2E]">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and{" "}
          <code className="rounded bg-[#F4F6F8] px-1.5 py-0.5 text-[#1A1F2E]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          to <code className="rounded bg-[#F4F6F8] px-1.5 py-0.5 text-[#1A1F2E]">.env.local</code>.
        </p>
      </div>
    );
  }

  if (submitted) {
    const contactFirstName = contactName.trim().split(/\s+/)[0] || "there";
    const waMsg = `Hi AutoSell, this is ${contactFirstName} from ${businessName}. I just submitted our rental fleet (${submitted.vehicleCount} vehicle${submitted.vehicleCount === 1 ? "" : "s"}) on the website. Please confirm and let me know the next steps.`;
    const waHref = waLink(waMsg);
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 md:px-8 md:py-20">
        <div className="rounded-2xl border border-[#E2E6EA] bg-white p-8 text-center shadow-sm md:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F6F0]">
            <Check className="h-7 w-7 text-[#00875A]" aria-hidden />
          </div>
          <div className="section-label justify-center">Signup received</div>
          <h1 className="font-display mt-2 text-2xl font-bold text-[#1A1F2E] md:text-3xl">
            Thanks, {contactFirstName}! {businessName}&apos;s fleet is in.
          </h1>
          <p className="mt-3 text-sm text-[#4B5563] md:text-base">
            We received {submitted.vehicleCount} vehicle{submitted.vehicleCount === 1 ? "" : "s"}. One more quick
            step — <b>WhatsApp AutoSell now</b> so we can confirm details and speed up approval.
          </p>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp font-display mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold sm:w-auto sm:px-8"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp AutoSell now
          </a>

          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <Link
              href="/rentals"
              className="font-display rounded-lg border border-[#E2E6EA] bg-white px-5 py-2.5 font-semibold text-[#1A1F2E] hover:bg-[#F4F6F8]"
            >
              Browse rentals on AutoSell
            </Link>
            <Link
              href="/"
              className="font-display rounded-lg border border-[#E2E6EA] bg-white px-5 py-2.5 font-semibold text-[#1A1F2E] hover:bg-[#F4F6F8]"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <div className="mb-8">
        <div className="section-label">Partner with us</div>
        <h1 className="font-display text-3xl font-bold text-[#1A1F2E] md:text-4xl">List your rental fleet</h1>
        <p className="mt-3 text-[#6B7280]">
          Guided steps — your business and fleet go to our team for review before listings go live for renters.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {steps.map((label, i) => (
          <div
            key={label}
            className={`font-display flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
              i === step
                ? "bg-[#E8500A] text-white shadow-sm"
                : i < step
                  ? "border border-[#00875A]/25 bg-[#E6F6F0] text-[#1A1F2E]"
                  : "border border-[#E2E6EA] bg-[#F4F6F8] text-[#6B7280]"
            }`}
          >
            {i < step ? <Check className="h-3.5 w-3.5 text-[#00875A]" aria-hidden /> : <span>{i + 1}</span>}
            {label}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>
      )}

      <form onSubmit={step === 3 ? onSubmit : (e) => e.preventDefault()} className="space-y-6">
        {step === 0 && (
          <div className="space-y-4 rounded-xl border border-[#E2E6EA] bg-white p-6 shadow-sm">
            <Field label="Business name *" value={businessName} onChange={setBusinessName} placeholder="Accra Wheels Rentals" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact name *" value={contactName} onChange={setContactName} />
              <Field label="Contact phone *" value={contactPhone} onChange={setContactPhone} type="tel" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email (optional)" value={contactEmail} onChange={setContactEmail} type="email" />
              <Field
                label="WhatsApp number (optional, defaults to phone)"
                value={whatsappNumber}
                onChange={setWhatsappNumber}
                type="tel"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A1F2E]">Location *</label>
              <select
                required
                value={businessLocation}
                onChange={(e) => setBusinessLocation(e.target.value)}
                className={selectClass}
              >
                <option value="">Select</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A1F2E]">About your business (optional)</label>
              <textarea
                rows={3}
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className={inputClass + " min-h-[80px]"}
                placeholder="How long you've been operating, fleet size, specialties…"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            {vehicles.map((v, idx) => (
              <div key={idx} className="space-y-4 rounded-xl border border-[#E2E6EA] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-[#1A1F2E]">Vehicle {idx + 1}</h3>
                  {vehicles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVehicle(idx)}
                      className="inline-flex items-center gap-1 rounded-md p-1.5 text-xs text-[#6B7280] hover:bg-[#FEE2E2] hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Make *"
                    value={v.carMake}
                    onChange={(val) => updateVehicle(idx, { carMake: val })}
                    placeholder="Toyota"
                  />
                  <Field
                    label="Model *"
                    value={v.carModel}
                    onChange={(val) => updateVehicle(idx, { carModel: val })}
                    placeholder="Corolla"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-[#1A1F2E]">Year *</label>
                    <select
                      required
                      value={v.year}
                      onChange={(e) => updateVehicle(idx, { year: e.target.value })}
                      className={selectClass}
                    >
                      <option value="">Select</option>
                      {buildYearOptions().map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1A1F2E]">Category</label>
                    <select
                      value={v.vehicleCategory}
                      onChange={(e) => updateVehicle(idx, { vehicleCategory: e.target.value })}
                      className={selectClass}
                    >
                      <option value="">Select</option>
                      {VEHICLE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-[#1A1F2E]">Transmission</label>
                    <select
                      value={v.transmission}
                      onChange={(e) => updateVehicle(idx, { transmission: e.target.value })}
                      className={selectClass}
                    >
                      <option value="">Select</option>
                      {TRANSMISSION_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1A1F2E]">Fuel type</label>
                    <select
                      value={v.fuelType}
                      onChange={(e) => updateVehicle(idx, { fuelType: e.target.value })}
                      className={selectClass}
                    >
                      <option value="">Select</option>
                      {FUEL_TYPE_OPTIONS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1A1F2E]">Listing type *</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["rent", "lease", "both"] as const).map((t) => (
                      <label
                        key={t}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                          v.listingType === t
                            ? "border-[#E8500A] bg-[#FFF0EB] text-[#E8500A] font-semibold"
                            : "border-[#E2E6EA] bg-white text-[#4B5563] hover:border-[#E8500A]/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`listingType-${idx}`}
                          value={t}
                          checked={v.listingType === t}
                          onChange={() => updateVehicle(idx, { listingType: t })}
                          className="sr-only"
                        />
                        {t === "rent" ? "Daily rental (₵/day)" : t === "lease" ? "Long-term lease (₵/month)" : "Both (daily + monthly)"}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Seats"
                    value={v.seats}
                    onChange={(val) => updateVehicle(idx, { seats: val })}
                    type="number"
                    min={1}
                  />
                  {(v.listingType === "rent" || v.listingType === "both") && (
                    <Field
                      label="Daily rate (₵) *"
                      value={v.dailyRate}
                      onChange={(val) => updateVehicle(idx, { dailyRate: val })}
                      placeholder="350"
                    />
                  )}
                  {(v.listingType === "lease" || v.listingType === "both") && (
                    <Field
                      label="Monthly rate (₵) *"
                      value={v.monthlyRate}
                      onChange={(val) => updateVehicle(idx, { monthlyRate: val })}
                      placeholder="5000"
                    />
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1A1F2E]">Pickup location *</label>
                  <select
                    required
                    value={v.location}
                    onChange={(e) => updateVehicle(idx, { location: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Select</option>
                    {LOCATIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-[#4B5563]">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={v.selfDrive}
                      onChange={(e) => updateVehicle(idx, { selfDrive: e.target.checked })}
                      className="h-4 w-4 rounded border-[#E2E6EA] text-[#E8500A] focus:ring-[#E8500A]"
                    />
                    Self-drive available
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={v.withDriver}
                      onChange={(e) => updateVehicle(idx, { withDriver: e.target.checked })}
                      className="h-4 w-4 rounded border-[#E2E6EA] text-[#E8500A] focus:ring-[#E8500A]"
                    />
                    With driver available
                  </label>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1A1F2E]">Description (optional)</label>
                  <textarea
                    rows={2}
                    value={v.description}
                    onChange={(e) => updateVehicle(idx, { description: e.target.value })}
                    className={inputClass + " min-h-[64px]"}
                    placeholder="Features, mileage limits, conditions…"
                  />
                </div>

                <div>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E2E6EA] bg-[#F4F6F8] px-4 py-6 text-center transition-colors hover:border-[#E8500A]/40 hover:bg-[#FFF0EB]/50">
                    <Upload className="h-7 w-7 text-[#E8500A]" aria-hidden />
                    <span className="font-display mt-1.5 text-xs font-semibold text-[#1A1F2E]">
                      Click to choose photos
                    </span>
                    <span className="mt-0.5 text-xs text-[#6B7280]">
                      Optional, up to {RENTAL_SIGNUP_MAX_PHOTOS_PER_VEHICLE} files
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => handleVehiclePhotoChange(idx, e)}
                    />
                  </label>
                  {v.files.length > 0 && (
                    <ul className="mt-2 grid grid-cols-1 gap-2 text-xs text-[#4B5563] sm:grid-cols-2">
                      {v.files.map((f, i) => (
                        <li
                          key={`${f.name}-${i}-${f.size}`}
                          className="flex items-center gap-2 rounded-lg border border-[#E2E6EA] bg-[#F4F6F8] px-2 py-1.5"
                        >
                          <span className="min-w-0 flex-1 truncate" title={f.name}>
                            {i + 1}. {f.name}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateVehicle(idx, { files: v.files.filter((_, fi) => fi !== i) })
                            }
                            className="shrink-0 rounded-md p-1 text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#1A1F2E]"
                            aria-label={`Remove ${f.name}`}
                          >
                            <X className="h-4 w-4" aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addVehicle}
              disabled={vehicles.length >= RENTAL_SIGNUP_MAX_VEHICLES}
              className="btn-outline font-display inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:pointer-events-none disabled:opacity-40"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add another vehicle
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 rounded-xl border border-[#E2E6EA] bg-white p-6 shadow-sm">
            <h3 className="font-display font-semibold text-[#1A1F2E]">{businessName || "Your business"}</h3>
            <p className="text-sm text-[#6B7280]">
              {contactName} · {contactPhone} · {businessLocation}
            </p>
            <div className="space-y-2">
              {vehicles.map((v, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#E2E6EA] bg-[#F4F6F8] px-3 py-2 text-sm text-[#4B5563]"
                >
                  {v.carMake} {v.carModel} ({v.year}) —{" "}
                  {v.listingType !== "lease" && v.dailyRate ? `₵${v.dailyRate}/day` : ""}
                  {v.listingType === "both" && v.monthlyRate ? " · " : ""}
                  {v.listingType !== "rent" && v.monthlyRate ? `₵${v.monthlyRate}/month` : ""}
                  {", "}{v.location || "—"}, {v.files.length} photo{v.files.length === 1 ? "" : "s"}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 rounded-xl border border-[#E2E6EA] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#6B7280]">
              This is free to list for now — your business and fleet will be reviewed by our team before going
              live publicly.
            </p>
            <label className="flex items-start gap-3 text-sm text-[#4B5563]">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-[#E2E6EA] text-[#E8500A] focus:ring-[#E8500A]"
              />
              <span>I agree to the terms and confirm the info above is accurate *</span>
            </label>
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="btn-outline font-display inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              className="btn-primary font-display inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
            >
              Continue
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary font-display rounded-lg px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit signup"}
            </button>
          )}
        </div>
        <Link href="/" className="block text-center text-sm font-medium text-[#6B7280] hover:text-[#E8500A]">
          ← Back to home
        </Link>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  min?: number;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-[#1A1F2E]">{label}</label>
      <input
        type={type}
        value={value}
        min={min}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}
