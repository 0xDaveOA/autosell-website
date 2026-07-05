import { Suspense } from "react";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeVerticals } from "@/components/home/HomeVerticals";
import { HomeFeatured } from "@/components/home/HomeFeatured";
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

      <HomeWhyUs />

      <HomeSellBanner />
      <HomePricing />
      <HomePartners />
      <HomeAbout />
      <HomeContact />
    </>
  );
}
