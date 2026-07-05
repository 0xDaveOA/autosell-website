export default function RentalsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <div className="mb-10 h-9 w-64 animate-pulse rounded-lg bg-neutral-200" />
      <p className="mb-10 h-4 max-w-xl animate-pulse rounded bg-neutral-200" />

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <aside className="lg:w-80 lg:shrink-0">
          <div className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)] p-4 md:p-5">
            {["h-5", "h-11", "h-11", "h-11", "h-20", "h-11"].map((h, i) => (
              <div key={i} className={`w-full animate-pulse rounded-xl bg-neutral-200 ${h}`} />
            ))}
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="listing-card flex animate-pulse flex-col bg-white sm:flex-row">
              <div className="aspect-[16/10] w-full bg-neutral-200 sm:min-h-[168px] sm:w-[260px] md:w-[280px]" />
              <div className="flex flex-1 flex-col gap-4 p-4 md:p-5">
                <div className="h-5 w-2/3 rounded bg-neutral-200" />
                <div className="h-8 w-1/3 rounded bg-neutral-200" />
                <div className="flex flex-wrap gap-2">
                  <span className="h-7 w-20 rounded-full bg-neutral-200" />
                  <span className="h-7 w-24 rounded-full bg-neutral-200" />
                  <span className="h-7 w-16 rounded-full bg-neutral-200" />
                </div>
                <div className="mt-auto flex gap-2 pt-4">
                  <div className="h-11 flex-1 rounded-lg bg-neutral-200" />
                  <div className="h-11 w-28 rounded-lg bg-neutral-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
