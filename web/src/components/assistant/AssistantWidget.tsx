"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { waLink } from "@/lib/whatsapp";
import type { AssistantSearchResult } from "@/types/assistant";
import type { AssistantChip, SearchDraft } from "./assistant-flows";
import { FLOWS, ROOT_NODE } from "./assistant-flows";
import { AssistantResultCard } from "./AssistantResultCard";

type ChatItem =
  | { kind: "bot"; text: string }
  | { kind: "user"; text: string }
  | { kind: "links"; links: { label: string; href: string }[] }
  | { kind: "results"; results: AssistantSearchResult[]; viewAllHref: string }
  | { kind: "typing" };

function nodeItems(nodeId: string): ChatItem[] {
  const node = FLOWS[nodeId];
  if (!node) return [];
  const items: ChatItem[] = node.bot.map((text) => ({ kind: "bot", text }));
  if (node.links?.length) items.push({ kind: "links", links: node.links });
  return items;
}

export function AssistantWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ChatItem[]>(() => nodeItems(ROOT_NODE));
  const [nodeId, setNodeId] = useState(ROOT_NODE);
  const [draft, setDraft] = useState<SearchDraft>({ vertical: "cars" });
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [items, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const runSearch = useCallback(async (d: SearchDraft) => {
    setBusy(true);
    setItems((prev) => [...prev, { kind: "typing" }]);

    const params = new URLSearchParams({ vertical: d.vertical });
    if (d.make) params.set("make", d.make);
    if (d.maxPrice != null) params.set("maxPrice", String(d.maxPrice));

    let results: AssistantSearchResult[] = [];
    try {
      const res = await fetch(`/api/assistant/search?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as { results?: AssistantSearchResult[] };
        results = json.results ?? [];
      }
    } catch {
      /* network error — fall through to empty results */
    }

    const browsePath = d.vertical === "cars" ? "/cars" : "/rentals";
    const viewAllParams = new URLSearchParams();
    if (d.make) viewAllParams.set("make", d.make);
    if (d.maxPrice != null && d.vertical === "cars") viewAllParams.set("maxPrice", String(d.maxPrice));
    const viewAllHref = viewAllParams.size ? `${browsePath}?${viewAllParams.toString()}` : browsePath;

    setItems((prev) => {
      const withoutTyping = prev.filter((i) => i.kind !== "typing");
      if (results.length === 0) {
        return [
          ...withoutTyping,
          { kind: "bot", text: "Hmm, no exact matches right now — but new listings arrive all the time! 👀" },
          { kind: "links", links: [{ label: d.vertical === "cars" ? "Browse all cars" : "Browse all rentals", href: browsePath }] },
        ];
      }
      return [
        ...withoutTyping,
        { kind: "bot", text: `Here's what I found for you: 🎉` },
        { kind: "results", results, viewAllHref },
      ];
    });
    setBusy(false);
  }, []);

  const handleChip = useCallback(
    (chip: AssistantChip) => {
      if (busy) return;

      if (chip.wa) {
        window.open(waLink(chip.wa), "_blank", "noopener,noreferrer");
        return;
      }

      setItems((prev) => [...prev, { kind: "user", text: chip.label }]);

      const nextDraft = chip.patch ? { ...draft, ...chip.patch } : draft;
      if (chip.patch) setDraft(nextDraft);

      if (chip.action === "search") {
        void runSearch(nextDraft);
        return;
      }

      if (chip.next) {
        setNodeId(chip.next);
        setItems((prev) => [...prev, ...nodeItems(chip.next!)]);
      }
    },
    [busy, draft, runSearch]
  );

  const closeAndReset = useCallback(() => {
    setOpen(false);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const node = FLOWS[nodeId] ?? FLOWS[ROOT_NODE];

  return (
    <>
      {/* Launcher — stacks above the WhatsApp FAB */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close AutoSell assistant" : "Open AutoSell assistant"}
        className="shadow-fab font-display fixed bottom-24 right-5 z-50 flex items-center gap-2 rounded-full bg-[var(--orange)] px-4 py-3 text-sm font-semibold text-white ring-2 ring-white/85 transition-transform hover:scale-[1.02] active:scale-[0.98] md:bottom-28 md:right-8"
      >
        <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
          />
        </svg>
        <span className="hidden sm:inline">Help</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="AutoSell assistant"
          className="fixed inset-x-3 bottom-3 top-16 z-[60] flex flex-col overflow-hidden rounded-2xl border border-[#E2E6EA] bg-white shadow-2xl md:inset-auto md:bottom-24 md:right-8 md:h-[560px] md:w-[380px] md:max-h-[calc(100dvh-140px)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-[#1A1F2E] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00875a] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00875a]" />
              </span>
              <p className="font-display text-sm font-bold text-white">AutoSell Assistant</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#F4F6F8] p-4">
            {items.map((item, i) => {
              if (item.kind === "bot") {
                return (
                  <div key={i} className="flex justify-start">
                    <p className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-md border border-[#E2E6EA] bg-white px-3.5 py-2.5 text-sm text-[#1A1F2E] shadow-sm">
                      {item.text}
                    </p>
                  </div>
                );
              }
              if (item.kind === "user") {
                return (
                  <div key={i} className="flex justify-end">
                    <p className="max-w-[85%] rounded-2xl rounded-br-md bg-[var(--orange)] px-3.5 py-2.5 text-sm font-medium text-white shadow-sm">
                      {item.text}
                    </p>
                  </div>
                );
              }
              if (item.kind === "links") {
                return (
                  <div key={i} className="flex flex-wrap gap-2 pl-1">
                    {item.links.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={closeAndReset}
                        className="btn-primary font-display rounded-lg px-4 py-2 text-xs font-semibold"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                );
              }
              if (item.kind === "results") {
                return (
                  <div key={i} className="space-y-2">
                    {item.results.map((r) => (
                      <AssistantResultCard key={`${r.vertical}-${r.id}`} result={r} onNavigate={closeAndReset} />
                    ))}
                    <Link
                      href={item.viewAllHref}
                      onClick={closeAndReset}
                      className="block pt-1 text-center text-xs font-semibold text-[var(--orange)] underline underline-offset-2"
                    >
                      View all matching listings →
                    </Link>
                  </div>
                );
              }
              // typing indicator
              return (
                <div key={i} className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-[#E2E6EA] bg-white px-4 py-3 shadow-sm">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9CA3AF]"
                        style={{ animationDelay: `${d * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chips */}
          <div className="border-t border-[#E2E6EA] bg-white p-3">
            <div className="flex flex-wrap gap-2">
              {node.chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  disabled={busy}
                  onClick={() => handleChip(chip)}
                  className="rounded-full border border-[#E2E6EA] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#374151] transition-all hover:border-[#E8500A]/50 hover:text-[#E8500A] disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
