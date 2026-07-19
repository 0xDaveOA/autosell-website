"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { AssistantSearchResult } from "@/types/assistant";

export function AssistantResultCard({
  result,
  onNavigate,
}: {
  result: AssistantSearchResult;
  onNavigate: () => void;
}) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <Link
      href={result.url}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-xl border border-[#E2E6EA] bg-white p-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#E8500A]/40 hover:shadow-md"
    >
      <div className="relative h-[54px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#FFF0EB] to-[#EEF6FA]">
        {result.photo && !imgErr ? (
          <Image
            src={result.photo}
            alt={result.title}
            fill
            className="object-cover"
            sizes="72px"
            unoptimized={result.photo.startsWith("http")}
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-6 w-6 text-[#D1D5DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 0m5 0h3m5 0h2v-4l-3-4H3m13 4V8"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-display truncate text-[13px] font-bold text-[#1A1F2E]">{result.title}</p>
        <p className="text-[13px] font-bold text-[var(--orange)]">{result.priceLabel}</p>
        <p className="truncate text-[11px] text-[#6B7280]">📍 {result.location}</p>
      </div>

      <svg className="h-4 w-4 shrink-0 text-[#9CA3AF]" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"
          clipRule="evenodd"
        />
      </svg>
    </Link>
  );
}
