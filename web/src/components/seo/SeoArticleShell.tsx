import type { ReactNode } from "react";

export function SeoArticleShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="bg-[var(--bg)] px-5 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display mb-3 text-3xl font-bold tracking-tight text-[#1A1F2E] md:text-4xl">
          {title}
        </h1>
        <div className="mt-8 space-y-6 text-base leading-relaxed text-[#4B5563] [&_strong]:font-semibold [&_strong]:text-[#1A1F2E] [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_h2]:font-display [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#1A1F2E] [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#1A1F2E] [&_p+a]:inline-block [&_table]:w-full [&_table]:min-w-[280px] [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-[var(--border)] [&_th]:bg-white [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-[#1A1F2E] [&_td]:border [&_td]:border-[var(--border)] [&_td]:bg-[var(--surface)] [&_td]:px-3 [&_td]:py-2 [&_.seo-inline-link]:font-semibold [&_.seo-inline-link]:text-[#E8500A] [&_.seo-inline-link]:underline [&_.seo-inline-link]:underline-offset-2 hover:[&_.seo-inline-link]:text-[#c8420a]">
          {children}
        </div>
      </div>
    </article>
  );
}

export function SeoCtaRow({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-8">
      {children}
    </div>
  );
}
