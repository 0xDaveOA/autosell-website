export default function CarDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <div className="mb-8 flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
        <div className="aspect-[16/10] animate-pulse rounded-xl bg-neutral-200 lg:col-span-3" />
        <div className="space-y-4 lg:col-span-2">
          <div className="h-6 w-24 animate-pulse rounded bg-neutral-200" />
          <div className="h-10 w-full animate-pulse rounded bg-neutral-200" />
          <div className="h-12 w-1/2 animate-pulse rounded bg-neutral-200" />
          <div className="flex flex-wrap gap-2">
            <span className="h-7 w-20 rounded-full bg-neutral-200" />
            <span className="h-7 w-24 rounded-full bg-neutral-200" />
          </div>
          <div className="h-14 w-full animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-14 w-full animate-pulse rounded-lg bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}
