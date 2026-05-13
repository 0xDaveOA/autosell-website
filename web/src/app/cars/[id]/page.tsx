import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, ArrowLeft } from "lucide-react";
import { fetchPublishedListingById } from "@/lib/listings";
import { normalizePhotos, parseListingYear } from "@/types/car-submission";
import { CarGallery } from "@/components/CarGallery";
import { listingEnquiryWaLink } from "@/lib/whatsapp";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n)) return { title: "Car" };
  const car = await fetchPublishedListingById(n);
  if (!car) return { title: "Not found" };
  const title = `${car.car_make} ${car.car_model}`.trim();
  const desc =
    car.car_description?.slice(0, 155) ?? `View this ${title} on AutoSell Ghana.`;

  const photos = normalizePhotos(car.photos);
  const hero = photos[0];
  const base = getSiteUrl();
  const canonical = `${base}/cars/${id}`;

  const imageMeta = hero ? [{ url: hero, alt: title }] : undefined;

  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: `${title} | AutoSell Ghana`,
      description: desc,
      type: "website",
      url: canonical,
      images: imageMeta,
    },
    twitter: {
      card: hero ? "summary_large_image" : "summary",
      title: `${title} | AutoSell Ghana`,
      description: desc,
      images: hero ? [hero] : undefined,
    },
  };
}

export default async function CarDetailPage({ params }: Props) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n)) notFound();

  const car = await fetchPublishedListingById(n);
  if (!car) notFound();

  const photos = normalizePhotos(car.photos);
  const title = `${car.car_make} ${car.car_model}`.trim();
  const yearLabel = parseListingYear(car.year) ?? String(car.year ?? "—");
  const waEnquiry = listingEnquiryWaLink({
    id: n,
    title,
    price: car.price,
    location: car.location,
    siteUrl: getSiteUrl(),
  });

  const specs = [
    { icon: "📅", label: "Year", value: yearLabel },
    { icon: "⚡", label: "Mileage", value: `${car.mileage.toLocaleString()} km` },
    ...(car.car_condition ? [{ icon: "✨", label: "Condition", value: car.car_condition }] : []),
    ...(car.transmission ? [{ icon: "⚙️", label: "Transmission", value: car.transmission }] : []),
    ...(car.fuel_type ? [{ icon: "⛽", label: "Fuel", value: car.fuel_type }] : []),
    ...(car.package_type ? [{ icon: "📦", label: "Package", value: car.package_type }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <nav className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#6B7280]">
        <Link href="/" className="transition-colors hover:text-[#E8500A]">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link href="/cars" className="transition-colors hover:text-[#E8500A]">
          Cars
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
              <span className="tag-available">{car.status}</span>
            </div>

            <h1 className="font-display text-2xl font-bold leading-tight text-[#1A1F2E] md:text-3xl">
              {title}
            </h1>

            <p className="font-display mt-3 text-3xl font-bold text-[#E8500A] md:text-4xl">
              ₵{car.price.toLocaleString("en-GH")}
            </p>

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
              <span>{car.location}</span>
            </div>

            <a
              href={waEnquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp font-display mt-8 flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-base font-semibold"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp AutoSell
            </a>

            <p className="mt-3 text-center text-xs text-[#9CA3AF]">
              Message AutoSell on WhatsApp — we&apos;ll help you with this listing and connect you with the seller.
            </p>

            <Link
              href="/cars"
              className="btn-outline font-display mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to all cars
            </Link>
          </div>
        </aside>
      </div>

      {car.car_description && (
        <section className="mt-12 rounded-xl border border-[#E2E6EA] bg-white p-6 shadow-sm md:p-8">
          <div className="section-label">Details</div>
          <h2 className="font-display mt-1 text-xl font-bold text-[#1A1F2E]">Description</h2>
          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-[#4B5563]">{car.car_description}</p>
        </section>
      )}
    </div>
  );
}
