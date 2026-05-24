"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  buildCarSubmissionRow,
  formatSupabaseInsertError,
  SELL_FORM_MAX_PHOTOS,
} from "@/lib/car-submission-insert";
import type { CarSubmissionInsertInput } from "@/lib/car-submission-insert";
import { ChevronLeft, ChevronRight, Upload, Check, X } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

import { TRANSMISSION_OPTIONS, FUEL_TYPE_OPTIONS } from "@/lib/listing-filters";
import { getPublicPaystackAmounts, isPaystackEnabled } from "@/lib/paystack-public";

function buildYearOptions(): string[] {
  const y = new Date().getFullYear();
  const list: string[] = [];
  for (let yr = y; yr >= 1990; yr--) list.push(String(yr));
  list.push("Older");
  return list;
}

const LOCATIONS = ["Accra", "Kumasi", "Tema", "Takoradi", "Cape Coast", "Tamale", "Other"] as const;

const inputClass =
  "mt-1 w-full rounded-lg border border-[#E2E6EA] bg-white px-3 py-2.5 text-sm text-[#1A1F2E] outline-none transition-colors focus:border-[#E8500A] focus:ring-2 focus:ring-[#E8500A]/15";

const selectClass =
  "mt-1 w-full rounded-lg border border-[#E2E6EA] bg-white px-3 py-2.5 text-sm text-[#1A1F2E] outline-none transition-colors focus:border-[#E8500A] focus:ring-2 focus:ring-[#E8500A]/15";

type Step = 0 | 1 | 2 | 3;

export function SellWizard({ initialPackage }: { initialPackage: string }) {
  const paystackEnabled = isPaystackEnabled();
  const payAmounts = getPublicPaystackAmounts();
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<number | null>(null);

  const [sellerName, setSellerName] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerLocation, setSellerLocation] = useState("");
  const [preferredContact, setPreferredContact] = useState("");

  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [carMileage, setCarMileage] = useState("");
  const [carPrice, setCarPrice] = useState("");
  const [carCondition, setCarCondition] = useState("");
  const [carTransmission, setCarTransmission] = useState("");
  const [carFuelType, setCarFuelType] = useState("");
  const [carDescription, setCarDescription] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [packageType, setPackageType] = useState(initialPackage);
  const [agree, setAgree] = useState(false);

  function next() {
    setError(null);
    if (step === 0) {
      if (
        !carMake.trim() ||
        !carModel.trim() ||
        !carYear ||
        !carMileage ||
        !carPrice ||
        !carCondition ||
        !carTransmission ||
        !carFuelType ||
        !carDescription.trim()
      ) {
        setError("Please complete all required vehicle fields.");
        return;
      }
    }
    if (step === 2) {
      if (!sellerName.trim() || !sellerPhone.trim() || !sellerLocation || !preferredContact) {
        setError("Please complete all required fields in this step.");
        return;
      }
    }
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  }

  function back() {
    setError(null);
    setStep((s) => (s > 0 ? ((s - 1) as Step) : s));
  }

  function handlePhotoInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) {
      setFiles([]);
      return;
    }
    if (picked.length > SELL_FORM_MAX_PHOTOS) {
      setError(
        `Please choose at most ${SELL_FORM_MAX_PHOTOS} photos (${picked.length} selected). Remove extras and try again.`
      );
      return;
    }
    setFiles(picked);
  }

  function removePhotoAt(index: number) {
    setError(null);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadPhotos(): Promise<{ urls: string[]; metadata: object[] }> {
    if (!supabase) throw new Error("Supabase is not configured");
    const urls: string[] = [];
    const metadata: object[] = [];
    const errors: string[] = [];

    const toUpload = files.slice(0, SELL_FORM_MAX_PHOTOS);
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: not an image file`);
        continue;
      }
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).slice(2, 15);
      const carFolder = `${carMake}_${carModel}_${timestamp}`.replace(/\s+/g, "_").replace(/[^\w-]/g, "_");
      const safeBase = (file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120) || "photo").replace(/^\./, "photo");
      const fileName = `submissions/${carFolder}/${timestamp}_${randomId}_${safeBase}`;

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
      throw new Error(
        `Photo upload failed: ${errors[0]}${errors.length > 1 ? ` (+${errors.length - 1} more)` : ""}. Try smaller images or skip photos for now.`
      );
    }

    return { urls, metadata };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!packageType) {
      setError("Please select an advertising package.");
      return;
    }
    if (!agree) {
      setError("Please agree to the terms to continue.");
      return;
    }
    if (files.length > SELL_FORM_MAX_PHOTOS) {
      setError(`Please use at most ${SELL_FORM_MAX_PHOTOS} photos. Remove extras on the photos step.`);
      return;
    }

    const paidPkg = packageType === "premium" || packageType === "complete";
    if (paystackEnabled && paidPkg) {
      const em = sellerEmail.trim();
      if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
        setError(
          "Add a valid email on your details step — Paystack sends the receipt there for Premium / Complete packages."
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      let photoUrls: string[] = [];
      let photoMetadata: object[] = [];
      if (files.length > 0) {
        const up = await uploadPhotos();
        photoUrls = up.urls;
        photoMetadata = up.metadata;
      }

      const input: CarSubmissionInsertInput = {
        car_make: carMake,
        car_model: carModel,
        year: carYear,
        price: carPrice,
        mileage: carMileage,
        location: sellerLocation,
        package_type: packageType,
        car_condition: carCondition,
        transmission: carTransmission,
        fuel_type: carFuelType,
        car_description: carDescription,
        seller_name: sellerName,
        seller_phone: sellerPhone,
        seller_email: sellerEmail,
        preferred_contact: preferredContact,
        additional_info: "",
        photos: photoUrls.length ? photoUrls : null,
        photo_metadata: photoMetadata.length ? photoMetadata : null,
      };

      const built = buildCarSubmissionRow(input);
      if (!built.ok) {
        setError(built.error);
        return;
      }

      const res = await fetch("/api/car-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      let insertOk = false;
      let submissionId: number | undefined;

      if (res.ok) {
        const json = (await res.json()) as { ok?: boolean; submissionId?: number };
        insertOk = true;
        submissionId = json.submissionId;
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        if (res.status === 503 && data.error === "NO_SERVICE_ROLE") {
          if (!supabase) throw new Error("Supabase is not configured for direct submit.");
          const { data: anonRow, error: insErr } = await supabase
            .from("car_submissions")
            .insert([built.row])
            .select("id")
            .maybeSingle();
          if (insErr) throw new Error(formatSupabaseInsertError(insErr));
          insertOk = true;
          submissionId = anonRow?.id as number | undefined;
        } else {
          throw new Error(data.error || data.message || `Submit failed (${res.status})`);
        }
      }

      if (!insertOk) return;

      if (typeof window !== "undefined" && (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq) {
        (window as unknown as { fbq: (...a: unknown[]) => void }).fbq("track", "CompleteRegistration", {
          content_name: "Car Listing Form",
          package_type: packageType,
        });
      }

      let payRedirect: string | null = null;
      if (paystackEnabled && paidPkg && submissionId != null && sellerEmail.trim().includes("@")) {
        const payRes = await fetch("/api/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId,
            packageType,
            email: sellerEmail.trim(),
          }),
        });
        const payJson = (await payRes.json().catch(() => ({}))) as {
          authorization_url?: string;
          error?: string;
          message?: string;
        };
        if (payRes.ok && payJson.authorization_url) payRedirect = payJson.authorization_url;
        else if (!payRes.ok && payJson.error !== "NO_PAYSTACK") {
          throw new Error(
            payJson.message || payJson.error || `Could not start payment (${payRes.status}).`
          );
        }
      }

      if (payRedirect) {
        window.location.href = payRedirect;
        return;
      }

      setSubmittedId(submissionId ?? -1);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const steps = ["Vehicle", "Photos", "Your details", "Package & send"];

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

  if (submittedId !== null) {
    const carTitle = `${carMake} ${carModel}`.trim() || "your car";
    const idLabel = submittedId > 0 ? ` #${submittedId}` : "";
    const sellerFirstName = sellerName.trim().split(/\s+/)[0] || "there";
    const waMsg = `Hi AutoSell, this is ${sellerFirstName}. I just submitted my ${carTitle}${idLabel} on the website. Please confirm and let me know the next steps.`;
    const waHref = waLink(waMsg);
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 md:px-8 md:py-20">
        <div className="rounded-2xl border border-[#E2E6EA] bg-white p-8 text-center shadow-sm md:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F6F0]">
            <Check className="h-7 w-7 text-[#00875A]" aria-hidden />
          </div>
          <div className="section-label justify-center">Listing received</div>
          <h1 className="font-display mt-2 text-2xl font-bold text-[#1A1F2E] md:text-3xl">
            Thanks, {sellerFirstName}! Your {carTitle}{idLabel} is in.
          </h1>
          <p className="mt-3 text-sm text-[#4B5563] md:text-base">
            One more quick step — <b>WhatsApp AutoSell now</b> so we can confirm details, verify your photos,
            and publish your listing faster. Listings that message us are usually live within a few hours.
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

          <p className="mt-3 text-xs text-[#6B7280]">
            Prefilled message includes your name and submission reference — just tap send.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <Link
              href="/cars"
              className="font-display rounded-lg border border-[#E2E6EA] bg-white px-5 py-2.5 font-semibold text-[#1A1F2E] hover:bg-[#F4F6F8]"
            >
              Browse cars on AutoSell
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
        <div className="section-label">Sell your car</div>
        <h1 className="font-display text-3xl font-bold text-[#1A1F2E] md:text-4xl">Advertise your car</h1>
        <p className="mt-3 text-[#6B7280]">
          Guided steps — your listing goes to our team for review before it goes live for buyers.
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
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      )}

      <form onSubmit={step === 3 ? onSubmit : (e) => e.preventDefault()} className="space-y-6">
        {step === 0 && (
          <div className="space-y-4 rounded-xl border border-[#E2E6EA] bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Make *" value={carMake} onChange={setCarMake} placeholder="Toyota" />
              <Field label="Model *" value={carModel} onChange={setCarModel} placeholder="Camry" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[#1A1F2E]">Year *</label>
                <select
                  required
                  value={carYear}
                  onChange={(e) => setCarYear(e.target.value)}
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
              <Field
                label="Mileage (km) *"
                value={carMileage}
                onChange={setCarMileage}
                type="number"
                min={0}
              />
            </div>
            <Field label="Asking price (₵) *" value={carPrice} onChange={setCarPrice} type="text" placeholder="85000" />
            <div>
              <label className="text-sm font-medium text-[#1A1F2E]">Condition *</label>
              <select
                required
                value={carCondition}
                onChange={(e) => setCarCondition(e.target.value)}
                className={selectClass}
              >
                <option value="">Select</option>
                {["Excellent", "Very Good", "Good", "Fair", "Needs Work"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[#1A1F2E]">Transmission *</label>
                <select
                  required
                  value={carTransmission}
                  onChange={(e) => setCarTransmission(e.target.value)}
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
                <label className="text-sm font-medium text-[#1A1F2E]">Fuel type *</label>
                <select
                  required
                  value={carFuelType}
                  onChange={(e) => setCarFuelType(e.target.value)}
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
              <label className="text-sm font-medium text-[#1A1F2E]">Description *</label>
              <textarea
                required
                rows={4}
                value={carDescription}
                onChange={(e) => setCarDescription(e.target.value)}
                className={inputClass + " min-h-[100px]"}
                placeholder="Features, history, reason for selling…"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#E8500A]/20 bg-gradient-to-br from-[#FFF8F3] to-[#F4F9FC] px-4 py-3 text-sm text-[#374151] shadow-sm">
              <p className="font-display font-semibold text-[#1A1F2E]">
                Photo checklist (max {SELL_FORM_MAX_PHOTOS})
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#6B7280]">
                Upload up to six images for an organised listing:{" "}
                <strong className="text-[#4B5563]">front</strong>,{" "}
                <strong className="text-[#4B5563]">driver side</strong>,{" "}
                <strong className="text-[#4B5563]">passenger side</strong>,{" "}
                <strong className="text-[#4B5563]">two interior</strong> (e.g. dashboard and seats), and{" "}
                <strong className="text-[#4B5563]">rear</strong>. Add them in that order if you can — the{" "}
                <strong className="text-[#4B5563]">first</strong> photo becomes the main image on the site.
              </p>
            </div>
            <div className="rounded-xl border border-[#E2E6EA] bg-white p-6 shadow-sm">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E2E6EA] bg-[#F4F6F8] px-4 py-10 text-center transition-colors hover:border-[#E8500A]/40 hover:bg-[#FFF0EB]/50">
                <Upload className="h-10 w-10 text-[#E8500A]" aria-hidden />
                <span className="font-display mt-2 text-sm font-semibold text-[#1A1F2E]">
                  Click to choose photos
                </span>
                <span className="mt-1 text-xs text-[#6B7280]">
                  JPG / PNG — optional, up to {SELL_FORM_MAX_PHOTOS} files (select multiple at once)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handlePhotoInputChange}
                />
              </label>
              {files.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-[#6B7280]">
                    Selected: {files.length} / {SELL_FORM_MAX_PHOTOS}
                  </p>
                  <ul className="grid grid-cols-1 gap-2 text-xs text-[#4B5563] sm:grid-cols-2">
                    {files.map((f, idx) => (
                      <li
                        key={`${f.name}-${idx}-${f.size}`}
                        className="flex items-center gap-2 rounded-lg border border-[#E2E6EA] bg-[#F4F6F8] px-2 py-1.5"
                      >
                        <span className="min-w-0 flex-1 truncate" title={f.name}>
                          {idx + 1}. {f.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePhotoAt(idx)}
                          className="shrink-0 rounded-md p-1 text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#1A1F2E]"
                          aria-label={`Remove ${f.name}`}
                        >
                          <X className="h-4 w-4" aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 rounded-xl border border-[#E2E6EA] bg-white p-6 shadow-sm">
            <Field label="Full name *" value={sellerName} onChange={setSellerName} />
            <Field label="Phone *" value={sellerPhone} onChange={setSellerPhone} type="tel" />
            <Field label="Email (optional)" value={sellerEmail} onChange={setSellerEmail} type="email" />
            <div>
              <label className="text-sm font-medium text-[#1A1F2E]">Location *</label>
              <select
                required
                value={sellerLocation}
                onChange={(e) => setSellerLocation(e.target.value)}
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
              <label className="text-sm font-medium text-[#1A1F2E]">Preferred contact *</label>
              <select
                required
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value)}
                className={selectClass}
              >
                <option value="">Select</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 rounded-xl border border-[#E2E6EA] bg-white p-6 shadow-sm">
            <div>
              <label className="text-sm font-medium text-[#1A1F2E]">Advertising package *</label>
              <select
                required
                value={packageType}
                onChange={(e) => {
                  const v = e.target.value;
                  setPackageType(v);
                  if (typeof window !== "undefined" && (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq && v) {
                    (window as unknown as { fbq: (...a: unknown[]) => void }).fbq("track", "Lead", {
                      package_type: v,
                    });
                  }
                }}
                className={selectClass}
              >
                <option value="">Select package</option>
                <option value="free">FREE Basic Listing — ₵0 (7 days)</option>
                <option value="premium">
                  Premium services — ₵{payAmounts.premium.toLocaleString("en-GH")}
                </option>
                <option value="complete">
                  Complete package — ₵{payAmounts.complete.toLocaleString("en-GH")}
                </option>
              </select>
            </div>
            {paystackEnabled && (
              <p className="text-xs leading-relaxed text-[#6B7280]">
                Premium / Complete online payment is active: use a real email on <strong>Your details</strong> — after
                submit we’ll send you to Paystack to pay (amounts configured on the server).
              </p>
            )}
            <label className="flex items-start gap-3 text-sm text-[#4B5563]">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-[#E2E6EA] text-[#E8500A] focus:ring-[#E8500A]"
              />
              <span>I agree to the terms and understand the pricing structure *</span>
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
              {submitting ? "Submitting…" : "Submit listing"}
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
