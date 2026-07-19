import { Suspense } from "react";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeVerticals } from "@/components/home/HomeVerticals";
import { HomeFeatured } from "@/components/home/HomeFeatured";
import { HomeRentalsShowcase } from "@/components/home/HomeRentalsShowcase";
import { HomeTravelBanner } from "@/components/home/HomeTravelBanner";
import {
  HomeWhyUs,
  HomeSellBanner,
  HomePricing,
  HomePartners,
  HomeAbout,
  HomeContact,
} from "@/components/home/HomeMarketing";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <HomeVerticals />

      <Suspense
        fallback={
          <section className="bg-[#F4F6F8] px-5 py-16 md:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="listing-card h-[160px] animate-pulse bg-white" />
                ))}
              </div>
            </div>
          </section>
        }
      >
        <HomeFeatured />
      </Suspense>

      <Suspense
        fallback={
          <section className="bg-white px-5 py-16 md:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-[320px] animate-pulse rounded-2xl bg-[#F4F6F8]" />
                ))}
              </div>
            </div>
          </section>
        }
      >
        <HomeRentalsShowcase />
      </Suspense>

      <HomeTravelBanner />

      <HomeWhyUs />

      <HomeSellBanner />
      <HomePricing />
      <HomePartners />
      <HomeAbout />
      <HomeContact />
    </>
  );
}
