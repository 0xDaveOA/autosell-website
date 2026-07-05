"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RentalListingWithPartner } from "@/types/rental-listing";
import { normalizePhotos, parseListingYear } from "@/types/rental-listing";
import { rentalEnquiryWaLink } from "@/lib/whatsapp";
import { getSiteUrl } from "@/lib/site-url";
import { SaveButton } from "@/components/SaveButton";

function formatPrice(rental: { listing_type: string; daily_rate: number; monthly_rate: number | null }): string {
  const type = rental.listing_type ?? "rent";
  const parts: string[] = [];
  if (type !== "lease" && rental.daily_rate > 0)
    parts.push(`₵${rental.daily_rate.toLocaleString("en-GH")}/day`);
  if (type !== "rent" && rental.monthly_rate)
    parts.push(`₵${rental.monthly_rate.toLocaleString("en-GH")}/mo`);
  return parts.join(" · ") || `₵${rental.daily_rate.toLocaleString("en-GH")}/day`;
}

export function RentalListingCard({ rental }: { rental: RentalListingWithPartner }) {
  const photos = useMemo(() => normalizePhotos(rental.photos), [rental.photos]);
  const [idx, setIdx] = useState(0);
  const [imgErr, setImgErr] = useState(false);

  const safeIdx = photos.length ? idx % photos.length : 0;
  const src = photos[safeIdx];
  const title = `${rental.car_make} ${rental.car_model}`.trim();
  const yearLabel = parseListingYear(rental.year) ?? String(rental.year ?? "—");

  const waHref = rentalEnquiryWaLink({
    id: rental.id,
    title,
    dailyRate: rental.daily_rate,
    monthlyRate: rental.monthly_rate,
    listingType: rental.listing_type,
    location: rental.location,
    siteUrl: getSiteUrl(),
    partnerWhatsapp: rental.rental_partners?.whatsapp_number ?? rental.rental_partners?.contact_phone,
  });

  const cycle = useCallback(
    (dir: -1 | 1) => {
      if (photos.length <= 1) return;
      setImgErr(false);
      setIdx((i) => (i + dir + photos.length) % photos.length);
    },
    [photos.length]
  );

  return (
    <article className="browse-car-card group flex flex-col overflow-hidden rounded-2xl border border-[#E2E6EA] bg-gradient-to-br from-white via-[#FFFBF8] to-[#F4F9FC] shadow-[0_4px_16px_rgba(232,80,10,0.06)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#E8500A]/35 hover:shadow-[0_14px_32px_rgba(232,80,10,0.12)]">
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-gradient-to-br from-[#FFF0EB] to-[#EEF6FA]">
        {src && !imgErr ? (
          <Image
            src={src}
            alt={`${title} — photo ${safeIdx + 1}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 360px"
            unoptimized={src.startsWith("http")}
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFF0EB]/80 to-[#E8F2FA]/90">
            <svg className="h-14 w-14 text-[#D1D5DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 0m5 0h3m5 0h2v-4l-3-4H3m13 4V8"
              />
            </svg>
          </div>
        )}

        <span className="absolute right-3 top-3 z-[5] rounded-lg bg-[#00875a] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md ring-1 ring-white/30 backdrop-blur-sm">
          {rental.listing_type === "lease" ? "Lease" : rental.listing_type === "both" ? "Rent & Lease" : "Available"}
        </span>

        <SaveButton listingType="rental" listingId={rental.id} />

        {photos.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              className="browse-car-nav browse-car-nav-prev"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                cycle(-1);
              }}
            >
              <ChevronLeft className="h-5 w-5 text-[var(--orange)]" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              className="browse-car-nav browse-car-nav-next"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                cycle(1);
              }}
            >
              <ChevronRight className="h-5 w-5 text-[var(--orange)]" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      <div
        className="h-1 w-full shrink-0 bg-gradient-to-r from-[var(--orange)] via-[#00875a] to-[#4a90e2] opacity-[0.92]"
        aria-hidden
      />

      <div className="flex flex-1 flex-col bg-gradient-to-b from-white/95 to-[#FAFCFE] p-4">
        <Link
          href={`/rentals/${rental.id}`}
          className="font-display mb-1 line-clamp-2 text-sm font-bold leading-snug text-[#1A1F2E] transition-colors hover:text-[var(--orange)] md:text-[15px]"
        >
          {title}
        </Link>

        <div className="mb-2 flex flex-col gap-1 text-xs font-medium text-[#4B5563]">
          <span className="flex items-center gap-1.5 rounded-lg bg-[#FFF5EF]/90 px-2 py-1 ring-1 ring-[#E8500A]/10">
            <span className="text-[var(--orange)]" aria-hidden>
              📅
            </span>
            {yearLabel}
          </span>
          {rental.vehicle_category ? (
            <span className="flex items-center gap-1.5 rounded-lg bg-[#E8F6F1]/80 px-2 py-1 ring-1 ring-[#00875a]/12">
              <span className="text-[#00875a]" aria-hidden>
                🚗
              </span>
              {rental.vehicle_category}
            </span>
          ) : null}
        </div>

        <div className="font-display mb-2 text-lg font-bold text-[var(--orange)] md:text-xl">
          {formatPrice(rental)}
        </div>

        <div className="mb-3 flex items-start gap-1.5 rounded-lg bg-[#F0F5FF]/90 px-2 py-1.5 text-xs text-[#4B5563] ring-1 ring-[#4a90e2]/15">
          <span className="shrink-0 text-[#2563eb]" aria-hidden>
            📍
          </span>
          <span className="line-clamp-2 leading-snug">
            {rental.location}
            {rental.rental_partners?.business_name ? ` · ${rental.rental_partners.business_name}` : ""}
          </span>
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="browse-btn-contact font-display flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold text-white shadow-sm sm:text-xs"
          >
            <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp partner
          </a>
          <Link
            href={`/rentals/${rental.id}`}
            className="browse-btn-details font-display flex flex-1 items-center justify-center rounded-lg border-2 border-[var(--orange)] bg-white py-2 text-[11px] font-semibold text-[var(--orange)] transition-colors hover:bg-[var(--orange)] hover:text-white sm:text-xs"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
