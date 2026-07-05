import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, ArrowLeft } from "lucide-react";
import { fetchActiveRentalListingById } from "@/lib/rental-listings";
import { normalizePhotos, parseListingYear } from "@/types/rental-listing";
import { CarGallery } from "@/components/CarGallery";
import { rentalEnquiryWaLink } from "@/lib/whatsapp";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n)) return { title: "Rental" };
  const rental = await fetchActiveRentalListingById(n);
  if (!rental) return { title: "Not found" };
  const title = `${rental.car_make} ${rental.car_model}`.trim();
  const desc = rental.description?.slice(0, 155) ?? `Rent this ${title} on AutoSell Ghana.`;

  const photos = normalizePhotos(rental.photos);
  const hero = photos[0];
  const base = getSiteUrl();
  const canonical = `${base}/rentals/${id}`;

  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: `${title} | AutoSell Ghana Rentals`,
      description: desc,
      type: "website",
      url: canonical,
      images: hero ? [{ url: hero, alt: title }] : undefined,
    },
    twitter: {
      card: hero ? "summary_large_image" : "summary",
      title: `${title} | AutoSell Ghana Rentals`,
      description: desc,
      images: hero ? [hero] : undefined,
    },
  };
}

export default async function RentalDetailPage({ params }: Props) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n)) notFound();

  const rental = await fetchActiveRentalListingById(n);
  if (!rental) notFound();

  const photos = normalizePhotos(rental.photos);
  const title = `${rental.car_make} ${rental.car_model}`.trim();
  const yearLabel = parseListingYear(rental.year) ?? String(rental.year ?? "—");
  const waEnquiry = rentalEnquiryWaLink({
    id: n,
    title,
    dailyRate: rental.daily_rate,
    monthlyRate: rental.monthly_rate,
    listingType: rental.listing_type,
    location: rental.location,
    siteUrl: getSiteUrl(),
    partnerWhatsapp: rental.rental_partners?.whatsapp_number ?? rental.rental_partners?.contact_phone,
  });

  const specs = [
    { icon: "📅", label: "Year", value: yearLabel },
    ...(rental.vehicle_category ? [{ icon: "🚗", label: "Category", value: rental.vehicle_category }] : []),
    ...(rental.transmission ? [{ icon: "⚙️", label: "Transmission", value: rental.transmission }] : []),
    ...(rental.fuel_type ? [{ icon: "⛽", label: "Fuel", value: rental.fuel_type }] : []),
    ...(rental.seats ? [{ icon: "🪑", label: "Seats", value: String(rental.seats) }] : []),
    {
      icon: "🧑‍✈️",
      label: "Driving",
      value: [rental.self_drive_available && "Self-drive", rental.with_driver_available && "With driver"]
        .filter(Boolean)
        .join(" / ") || "—",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <nav className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#6B7280]">
        <Link href="/" className="transition-colors hover:text-[#E8500A]">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link href="/rentals" className="transition-colors hover:text-[#E8500A]">
          Rentals
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-[#1A1F2E]">{title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
        <div className="lg:col-span-3">
          <CarGallery images={photos} title={title} />
        </div>

        <aside className="lg:col-span-2">
          <div className="listing-card flex-col border-[#E2E6EA] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="tag-available">Available</span>
            </div>

            <h1 className="font-display text-2xl font-bold leading-tight text-[#1A1F2E] md:text-3xl">{title}</h1>

            <div className="mt-3 flex flex-wrap gap-2">
              {(rental.listing_type !== "lease" && rental.daily_rate > 0) && (
                <p className="font-display text-3xl font-bold text-[#E8500A] md:text-4xl">
                  ₵{rental.daily_rate.toLocaleString("en-GH")}<span className="text-xl font-semibold">/day</span>
                </p>
              )}
              {rental.listing_type !== "rent" && rental.monthly_rate && (
                <p className="font-display text-3xl font-bold text-[#00875a] md:text-4xl">
                  ₵{rental.monthly_rate.toLocaleString("en-GH")}<span className="text-xl font-semibold">/month</span>
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {specs.map((s) => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E6EA] bg-[#F4F6F8] px-2.5 py-1 text-xs font-medium text-[#4B5563]"
                >
                  <span className="text-[10px]" aria-hidden>
                    {s.icon}
                  </span>
                  <span className="sr-only">{s.label}: </span>
                  {s.value}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-2 text-sm text-[#6B7280]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E8500A]" aria-hidden />
              <span>{rental.location}</span>
            </div>

            {rental.rental_partners?.business_name ? (
              <p className="mt-2 text-sm text-[#6B7280]">
                Offered by <span className="font-semibold text-[#1A1F2E]">{rental.rental_partners.business_name}</span>
              </p>
            ) : null}

            <a
              href={waEnquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp font-display mt-8 flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-base font-semibold"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp partner
            </a>

            <p className="mt-3 text-center text-xs text-[#9CA3AF]">
              Message the rental partner directly on WhatsApp to check availability and book.
            </p>

            <Link
              href="/rentals"
              className="btn-outline font-display mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to all rentals
            </Link>
          </div>
        </aside>
      </div>

      {rental.description && (
        <section className="mt-12 rounded-xl border border-[#E2E6EA] bg-white p-6 shadow-sm md:p-8">
          <div className="section-label">Details</div>
          <h2 className="font-display mt-1 text-xl font-bold text-[#1A1F2E]">Description</h2>
          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-[#4B5563]">{rental.description}</p>
        </section>
      )}
    </div>
  );
}
