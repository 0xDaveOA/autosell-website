import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

/** Matches autosell_pricing_page_rewrite.html */
const PX = "#D85A30";

const features = [
  {
    icon: "🔒",
    title: "Verified Sellers",
    desc: "Every seller is reviewed before going live. Buy with confidence from trusted sources.",
  },
  {
    icon: "📱",
    title: "WhatsApp First",
    desc: "Enquire on WhatsApp through AutoSell — we help you with each listing and connect you with the seller.",
  },
  {
    icon: "📣",
    title: "Social Reach",
    desc: "Your listing gets promoted on Facebook and Instagram for maximum buyer exposure.",
  },
  {
    icon: "🇬🇭",
    title: "Built for Ghana",
    desc: "GHS pricing, local cities, mobile-optimised — designed specifically for Ghanaian buyers.",
  },
];

export function HomeWhyUs() {
  return (
    <section className="bg-white px-5 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="section-label justify-center">Why AutoSell Ghana</div>
          <h2 className="font-display text-2xl font-bold text-[#1A1F2E] md:text-3xl">
            The smarter way to buy & sell
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={i} className="card p-6 text-center hover:border-[#E8500A]/30">
              <div className="mb-4 text-4xl">{f.icon}</div>
              <h3 className="font-display mb-2 text-base font-semibold text-[#1A1F2E]">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[#6B7280]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeSellBanner() {
  return (
    <section className="bg-[#1A1F2E] px-5 py-14 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FF7A3D]">
              <span className="block h-0.5 w-6 rounded bg-[#FF7A3D]" />
              Sell your car
            </div>
            <h2 className="font-display mb-3 mt-1 text-2xl font-bold text-white md:text-4xl">
              Reach thousands of buyers
              <br />
              <span className="text-[#FF7A3D]">for free.</span>
            </h2>
            <p className="max-w-md text-base leading-relaxed text-[#9CA3AF]">
              List your car in minutes. Add photos, set your price, and start getting WhatsApp enquiries from serious
              buyers across Ghana.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href="/sell"
              className="btn-primary font-display inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-sm font-semibold"
            >
              List my car — it&apos;s free
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/#pricing"
              className="font-display inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/8"
            >
              See pricing
            </Link>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-10">
          {[
            { n: "01", t: "Fill in your car details", s: "Make, model, year, price and condition" },
            { n: "02", t: "Upload photos", s: "Add up to 10 clear photos of your car" },
            { n: "03", t: "Go live & get enquiries", s: "Buyers contact you directly on WhatsApp" },
          ].map((step) => (
            <div key={step.n} className="flex items-start gap-4">
              <div className="font-display mt-0.5 shrink-0 text-2xl font-extrabold leading-none text-[#E8500A]">
                {step.n}
              </div>
              <div>
                <div className="font-display mb-1 text-sm font-semibold text-white">{step.t}</div>
                <div className="hidden text-xs leading-relaxed text-[#9CA3AF] sm:block">{step.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type PricingFeature = { text: string; included: boolean };

type PricingPlan = {
  name: string;
  featured: boolean;
  priceMain: string;
  priceSuffix: string | null;
  tagline: string;
  features: PricingFeature[];
  cta: string;
  ctaPrimary: boolean;
  ctaNote: string;
  href: string;
};

const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    featured: false,
    priceMain: "₵0",
    priceSuffix: null,
    tagline: "Test us out — no payment needed",
    features: [
      { text: "Listed on autosellgh.com for 7 days", included: true },
      { text: "Photo gallery (up to 5 photos)", included: true },
      { text: "WhatsApp contact button for buyers", included: true },
      { text: "No social media promotion", included: false },
      { text: "No WhatsApp buyer blast", included: false },
      { text: "No homepage feature", included: false },
    ],
    cta: "List for free",
    ctaPrimary: false,
    ctaNote: "No credit card. Takes 5 minutes.",
    href: "/sell?package=free",
  },
  {
    name: "Premium",
    featured: true,
    priceMain: "₵50",
    priceSuffix: "/ listing",
    tagline: "Most sellers get their first inquiry within 48 hours",
    features: [
      { text: "Listed on autosellgh.com for 30 days", included: true },
      { text: "Posted to 50+ Ghana car Facebook groups", included: true },
      { text: "Sent to our WhatsApp buyer alert list", included: true },
      { text: "Instagram + Facebook page promotion", included: true },
      { text: "Featured homepage placement", included: true },
      { text: "Priority WhatsApp support", included: true },
    ],
    cta: "Get Premium — ₵50",
    ctaPrimary: true,
    ctaNote: "Most sellers close in under 2 weeks",
    href: "/sell?package=premium",
  },
  {
    name: "Complete",
    featured: false,
    priceMain: "₵200",
    priceSuffix: null,
    tagline: "Best value if your car is above ₵30,000",
    features: [
      { text: "Everything in Premium", included: true },
      { text: "Listed for 60 days", included: true },
      { text: "Professional photography session", included: true },
      { text: "TikTok + YouTube Shorts video reel", included: true },
      { text: "Weekly listing performance report", included: true },
      { text: "Money-back if no inquiries in 14 days", included: true },
    ],
    cta: "Go Complete — ₵200",
    ctaPrimary: false,
    ctaNote: "Guaranteed inquiries or your money back",
    href: "/sell?package=complete",
  },
];

export function HomePricing() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-[#F4F6F8] px-5 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="sr-only">AutoSell Ghana pricing plans for car sellers</h2>

        <div className="mb-10 text-center md:mb-12">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-[0.08em]" style={{ color: PX }}>
            — Sell faster, reach more buyers —
          </p>
          <h3 className="font-display mx-auto mb-2 max-w-2xl text-[26px] font-medium leading-snug text-[#1A1F2E]">
            Your car deserves more than one Facebook post
          </h3>
          <p className="mx-auto max-w-xl text-[15px] text-[#6B7280]">
            List on AutoSell and reach buyers across Accra, Kumasi, Tema and beyond
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl bg-white px-5 pb-5 pt-6 ${
                plan.featured ? "border-2 shadow-sm" : "border border-[#E2E6EA] shadow-sm"
              }`}
              style={plan.featured ? { borderColor: PX } : undefined}
            >
              {plan.featured ? (
                <span
                  className="absolute left-1/2 top-0 z-[1] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3.5 py-1 text-[11px] font-medium text-white"
                  style={{ backgroundColor: PX }}
                >
                  Most popular
                </span>
              ) : null}

              <p
                className={`mb-1 text-base font-medium ${plan.featured ? "" : "text-[#1A1F2E]"}`}
                style={plan.featured ? { color: PX } : undefined}
              >
                {plan.name}
              </p>
              <p className="font-display mb-1 text-[30px] font-medium leading-tight" style={{ color: PX }}>
                {plan.priceMain}{" "}
                {plan.priceSuffix ? (
                  <span className="text-sm font-normal text-[#6B7280]">{plan.priceSuffix}</span>
                ) : null}
              </p>
              <p className="mb-0 min-h-[36px] text-[13px] leading-snug text-[#6B7280]">{plan.tagline}</p>

              <hr className="my-4 border-0 border-t border-[#E2E6EA]" />

              <ul className="mb-5 flex-1 space-y-1">
                {plan.features.map((f) => (
                  <li
                    key={f.text}
                    className={`flex gap-2 text-[13px] leading-snug ${f.included ? "text-[#1A1F2E]" : "text-[#6B7280]"}`}
                  >
                    {f.included ? (
                      <Check className="mt-px h-[15px] w-[15px] shrink-0" strokeWidth={2.5} style={{ color: PX }} aria-hidden />
                    ) : (
                      <X className="mt-px h-[15px] w-[15px] shrink-0 text-[#6B7280]" strokeWidth={2.5} aria-hidden />
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full rounded-md py-2.5 text-center text-sm font-medium transition-[filter,transform] hover:brightness-[1.03] active:scale-[0.99] ${
                  plan.ctaPrimary ? "text-white" : "border-[1.5px] border-[#C8CDD3] bg-transparent text-[#1A1F2E]"
                }`}
                style={
                  plan.ctaPrimary
                    ? { backgroundColor: PX, borderColor: PX, borderWidth: "1.5px", borderStyle: "solid" }
                    : undefined
                }
              >
                {plan.cta}
              </Link>
              <p className="mt-2 text-center text-[11px] text-[#6B7280]">{plan.ctaNote}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-6 flex max-w-5xl flex-wrap justify-around gap-2 rounded-lg bg-[#EDF0F3] px-4 py-3 md:gap-6">
          {[
            ["48hrs", "Avg. time to first inquiry"],
            ["50+", "Facebook groups we post to"],
            ["₵0", "Commission on your sale"],
            ["Ghana-wide", "Buyer reach"],
          ].map(([num, lab]) => (
            <div key={lab} className="min-w-[100px] flex-1 text-center">
              <p className="text-lg font-medium text-[#1A1F2E]">{num}</p>
              <p className="text-[11px] text-[#6B7280]">{lab}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomePartners() {
  return (
    <section id="partner" className="scroll-mt-24 bg-white px-5 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-10 md:flex-row">
          <div className="flex-1">
            <div className="section-label">Partner with us</div>
            <h2 className="font-display mt-1 mb-4 text-2xl font-bold text-[#1A1F2E] md:text-3xl">
              Grow your automotive business with AutoSell
            </h2>
            <p className="mb-6 text-base leading-relaxed text-[#6B7280]">
              Whether you&apos;re a garage, dealership, or auto service provider — join our network and reach more customers
              across Ghana.
            </p>
            <a
              href={waLink("Hi, I'd like to partner with AutoSell Ghana")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary font-display inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm"
            >
              Talk to us on WhatsApp
            </a>
          </div>
          <div className="grid flex-1 grid-cols-1 gap-4">
            {[
              { icon: "🏪", t: "Garages & Dealerships", d: "List your full inventory and connect with serious buyers." },
              { icon: "🚗", t: "Private Sellers", d: "Advertise your car and get buyers contacting you directly." },
              { icon: "🔧", t: "Auto Services", d: "Promote your repair, detailing or insurance services to car owners." },
            ].map((p, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-xl border border-[#E2E6EA] bg-[#F4F6F8] p-4 transition-colors hover:border-[#E8500A]/30"
              >
                <span className="shrink-0 text-2xl">{p.icon}</span>
                <div>
                  <div className="font-display mb-1 text-sm font-semibold text-[#1A1F2E]">{p.t}</div>
                  <div className="text-sm text-[#6B7280]">{p.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeAbout() {
  return (
    <section id="about" className="scroll-mt-24 bg-[#F4F6F8] px-5 py-16 md:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
        <div>
          <div className="section-label">About us</div>
          <h2 className="font-display mt-2 text-2xl font-bold text-[#1A1F2E] md:text-3xl">About AutoSell Ltd</h2>
          <p className="mt-4 leading-relaxed text-[#6B7280]">
            We connect buyers and sellers across Ghana with a modern site, real promotion, and human support on WhatsApp.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              ["3+", "Years"],
              ["15+", "Cities"],
              ["98%", "Satisfaction"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl border border-[#E2E6EA] bg-white p-4 shadow-sm">
                <div className="text-2xl font-bold text-[#E8500A]">{n}</div>
                <div className="text-xs text-[#6B7280]">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
          <Image src="/photo_2025-02-22_10-14-40.jpg" alt="AutoSell Ghana" fill className="object-cover" sizes="(max-width:768px) 100vw, 400px" />
        </div>
      </div>
    </section>
  );
}

export function HomeContact() {
  return (
    <section id="contact" className="scroll-mt-24 bg-white px-5 py-16 md:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <div className="section-label justify-center">Get in touch</div>
        <h2 className="font-display mt-1 mb-3 text-2xl font-bold text-[#1A1F2E] md:text-3xl">We&apos;re here to help</h2>
        <p className="mx-auto mb-10 max-w-md text-[#6B7280]">
          Have a question about buying, selling or partnering? Reach us through any of these channels.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            {
              label: "WhatsApp",
              sub: "+233 50 567 7556",
              href: waLink("Hi AutoSell Ghana!"),
              icon: "💬",
              tile:
                "border-[#25D366]/55 bg-gradient-to-br from-[#DCFCE7] via-[#ECFDF5] to-[#D1FAE5] hover:border-[#128C7E] hover:shadow-[0_10px_28px_-6px_rgba(37,211,102,0.45)]",
              iconBg: "bg-[#25D366]/20 ring-2 ring-[#25D366]/25",
              titleClr: "text-[#065F46]",
              subClr: "text-[#047857]/90",
            },
            {
              label: "Facebook",
              sub: "AutoSell Ltd",
              href: "https://www.facebook.com/profile.php?id=61573682903085",
              icon: "📘",
              tile:
                "border-[#1877F2]/45 bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE]/80 to-[#E0E7FF] hover:border-[#1877F2] hover:shadow-[0_10px_28px_-6px_rgba(24,119,242,0.35)]",
              iconBg: "bg-[#1877F2]/15 ring-2 ring-[#1877F2]/20",
              titleClr: "text-[#1E40AF]",
              subClr: "text-[#1D4ED8]/85",
            },
            {
              label: "Instagram",
              sub: "@autosell_ltd",
              href: "https://www.instagram.com/autosell_ltd/",
              icon: "📸",
              tile:
                "border-2 border-[#E11D48]/35 bg-gradient-to-br from-[#FDF4FF] via-[#FFF7ED] to-[#FCE7F3] hover:border-[#C026D3]/50 hover:shadow-[0_10px_28px_-6px_rgba(225,48,108,0.3)]",
              iconBg:
                "bg-gradient-to-br from-[#FBCFE8] to-[#FDE68A]/70 ring-2 ring-[#E11D48]/25",
              titleClr: "text-[#9D174D]",
              subClr: "text-[#BE185D]/85",
            },
          ].map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`contact-channel-tile flex min-w-[220px] items-center gap-3 rounded-xl border-2 px-5 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 ${c.tile}`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl ${c.iconBg}`}
              >
                {c.icon}
              </span>
              <span className="text-left">
                <span className={`font-display block text-sm font-semibold ${c.titleClr}`}>{c.label}</span>
                <span className={`block text-xs ${c.subClr}`}>{c.sub}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
