// Edit these quotes here — name, role, and quote text are all placeholder
// content until real customer feedback comes in.
const TESTIMONIALS = [
  {
    name: "Kwame Mensah",
    role: "Bought a Toyota Corolla · Accra",
    quote:
      "I found my Corolla on AutoSell in one evening. The WhatsApp enquiry made everything easy — no endless calls, straight to the point. Picked up the car that same week.",
  },
  {
    name: "Ama Owusu",
    role: "Sold her Hyundai · Tema",
    quote:
      "Listing was free and took me 10 minutes. AutoSell even posted my car on their Facebook page. I had three serious buyers and sold in 9 days at my asking price.",
  },
  {
    name: "Yaw Boateng",
    role: "Rental partner · Kumasi",
    quote:
      "As a rental business, the partner platform brings me customers I would never reach on my own. Clients message me directly on WhatsApp — simple and effective.",
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function HomeTestimonials() {
  return (
    <section className="bg-[#F4F6F8] px-5 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <div className="section-label">What people say</div>
          <h2 className="font-display text-2xl font-bold text-[#1A1F2E] md:text-3xl">
            Trusted across Ghana
          </h2>
          <p className="mt-2 text-[#6B7280]">Real buyers, sellers, and rental partners on AutoSell</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-[#E2E6EA] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 flex gap-0.5 text-[var(--orange)]" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((i) => (
                  <svg key={i} className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118L2.077 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674Z" />
                  </svg>
                ))}
              </div>

              <blockquote className="flex-1 text-sm leading-relaxed text-[#4B5563]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-5 flex items-center gap-3 border-t border-[#F0F2F4] pt-4">
                <span className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff0eb] text-sm font-bold text-[var(--orange)]">
                  {initials(t.name)}
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-[#1A1F2E]">{t.name}</p>
                  <p className="text-xs text-[#6B7280]">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
