import Link from "next/link";

const PANELS = [
  {
    href: "/flights",
    gradient: "from-[#2563eb] to-[#1e40af]",
    textColor: "text-[#2563eb]",
    title: "Find Cheap Flights",
    desc: "Search live prices from Accra to anywhere in the world — compare airlines in seconds.",
    cta: "Search flights",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
        />
      </svg>
    ),
  },
  {
    href: "/hotels",
    gradient: "from-[#7c3aed] to-[#5b21b6]",
    textColor: "text-[#7c3aed]",
    title: "Book Hotels & Stays",
    desc: "Hotels, guest houses, and apartments across Ghana and beyond — best prices guaranteed.",
    cta: "Search hotels",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
        />
      </svg>
    ),
  },
];

export function HomeTravelBanner() {
  return (
    <section className="bg-[#F4F6F8] px-5 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <div className="section-label">Beyond the road</div>
          <h2 className="font-display text-2xl font-bold text-[#1A1F2E] md:text-3xl">
            Travel starts here too
          </h2>
          <p className="mt-2 text-[#6B7280]">Flights and stays — search and compare without leaving AutoSell</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {PANELS.map((p) => (
            <div
              key={p.href}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${p.gradient} p-8 text-white md:p-10`}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-14 -left-8 h-36 w-36 rounded-full bg-white/[0.07]"
                aria-hidden
              />

              <div className="relative">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                  {p.icon}
                </div>
                <h3 className="font-display text-xl font-bold md:text-2xl">{p.title}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/85 md:text-base">{p.desc}</p>
                <Link
                  href={p.href}
                  className={`font-display mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold ${p.textColor} transition-transform hover:scale-[1.02]`}
                >
                  {p.cta}
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
