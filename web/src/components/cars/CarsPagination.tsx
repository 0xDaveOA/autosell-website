import Link from "next/link";

type CarsPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  hrefForPage: (page: number) => string;
};

function pageNumbers(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i];
    const prev = sorted[i - 1];
    if (i > 0 && prev !== undefined && n - prev > 1) out.push(-1);
    out.push(n);
  }
  return out;
}

export function CarsPagination({ page, totalPages, total, pageSize, hrefForPage }: CarsPaginationProps) {
  if (totalPages <= 1) return null;

  const nums = pageNumbers(page, totalPages);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      className="mt-10 flex flex-col items-center gap-4 border-t border-[var(--color-border)] pt-8 sm:flex-row sm:justify-between"
      aria-label="Pagination"
    >
      <p className="text-sm text-neutral-600">
        Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1">
        {page > 1 ? (
          <Link
            href={hrefForPage(page - 1)}
            className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[#1A1F2E] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            rel="prev"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-neutral-400">
            Previous
          </span>
        )}

        <ul className="flex flex-wrap items-center gap-1">
          {nums.map((n, i) =>
            n === -1 ? (
              <li key={`gap-${i}`} className="px-2 text-neutral-400">
                …
              </li>
            ) : (
              <li key={n}>
                {n === page ? (
                  <span
                    className="inline-flex min-w-[2.25rem] justify-center rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-bold text-white"
                    aria-current="page"
                  >
                    {n}
                  </span>
                ) : (
                  <Link
                    href={hrefForPage(n)}
                    className="inline-flex min-w-[2.25rem] justify-center rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-[#1A1F2E] hover:border-[var(--color-border)] hover:bg-white"
                  >
                    {n}
                  </Link>
                )}
              </li>
            )
          )}
        </ul>

        {page < totalPages ? (
          <Link
            href={hrefForPage(page + 1)}
            className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[#1A1F2E] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            rel="next"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-neutral-400">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
