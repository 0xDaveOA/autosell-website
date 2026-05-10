import Link from "next/link";
import { SEO_GUIDE_NAV } from "@/lib/seo-guide-paths";
import { waLink } from "@/lib/whatsapp";

export function SiteFooter() {
  const y = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#1A1F2E] px-5 pb-6 pt-12 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display mb-3 text-xl font-bold">
              Auto<span className="text-[#E8500A]">Sell</span> Ghana
            </div>
            <p className="mb-4 text-sm leading-relaxed text-[#9CA3AF]">
              Ghana&apos;s trusted platform for buying and selling quality cars.
            </p>
            <div className="flex gap-3">
              {[
                ["https://www.facebook.com/profile.php?id=61573682903085", "FB"],
                ["https://www.instagram.com/autosell_ltd/", "IG"],
                [waLink("Hi AutoSell Ghana!"), "WA"],
              ].map(([h, l]) => (
                <a
                  key={l}
                  href={h}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-xs font-bold text-[#9CA3AF] transition-all hover:bg-[#E8500A]/20 hover:text-white"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="font-display mb-4 text-sm font-semibold text-white">Quick links</div>
            <ul className="space-y-2.5">
              {[
                ["Home", "/"],
                ["Browse Cars", "/cars"],
                ["Sell Your Car", "/sell"],
                ["Pricing", "/#pricing"],
                ["Partner With Us", "/#partner"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-[#9CA3AF] transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-display mb-4 text-sm font-semibold text-white">Guides</div>
            <ul className="space-y-2.5">
              {SEO_GUIDE_NAV.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-[#9CA3AF] transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-display mb-4 text-sm font-semibold text-white">Services</div>
            <ul className="space-y-2.5">
              {[
                ["Car Advertising", "/sell"],
                ["Garage Partnerships", "/#partner"],
                ["Browse Listings", "/cars"],
                ["Contact Support", "/#contact"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-[#9CA3AF] transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-display mb-4 text-sm font-semibold text-white">Contact</div>
            <ul className="space-y-2.5 text-sm text-[#9CA3AF]">
              <li>+233 50 567 7556</li>
              <li>AutoSell Ltd (Facebook)</li>
              <li>@autosell_ltd</li>
              <li>Accra, Ghana 🇬🇭</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-xs text-[#6B7280]">© {y} AutoSell Ltd. All rights reserved.</p>
          <p className="text-xs text-[#4B5563]">Built for the Ghana automotive community</p>
        </div>
      </div>
    </footer>
  );
}
