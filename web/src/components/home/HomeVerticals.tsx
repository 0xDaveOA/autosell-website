import Link from "next/link";

const VERTICALS = [
  {
    href: "/cars",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    label: "Buy a Car",
    desc: "Browse verified cars for sale across Ghana",
    cta: "Browse Cars",
    accent: "#E8500A",
    bg: "#fff0eb",
  },
  {
    href: "/rentals",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
      </svg>
    ),
    label: "Rent a Car",
    desc: "Daily rentals with or without a driver in Ghana",
    cta: "Find Rentals",
    accent: "#00875a",
    bg: "#e6f6f0",
  },
  {
    href: "/flights",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
    ),
    label: "Find Flights",
    desc: "Search flights from Accra to anywhere in the world",
    cta: "Search Flights",
    accent: "#2563eb",
    bg: "#eff6ff",
  },
  {
    href: "/hotels",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
      </svg>
    ),
    label: "Find Hotels",
    desc: "Hotels, stays & accommodation across Africa",
    cta: "Search Hotels",
    accent: "#7c3aed",
    bg: "#f5f3ff",
  },
];

export function HomeVerticals() {
  return (
    <section className="bg-white px-5 py-14 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-bold text-[#1a1f2e] md:text-3xl">
            Everything you need to move in Ghana
          </h2>
          <p className="mt-2 text-[#6B7280]">Buy, rent, fly, or stay — all in one place</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {VERTICALS.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className="group flex flex-col items-start rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg md:p-6"
              style={
                {
                  "--v-accent": v.accent,
                  "--v-bg": v.bg,
                } as React.CSSProperties
              }
            >
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl transition-colors duration-200 group-hover:bg-[var(--v-bg)]"
                style={{ backgroundColor: v.bg, color: v.accent }}
              >
                {v.icon}
              </div>

              <h3 className="font-display text-base font-bold text-[#1a1f2e] md:text-lg">{v.label}</h3>
              <p className="mt-1 mb-4 text-xs text-[#6B7280] leading-relaxed md:text-sm">{v.desc}</p>

              <span
                className="mt-auto inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 group-hover:opacity-90"
                style={{ backgroundColor: v.accent }}
              >
                {v.cta}
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
