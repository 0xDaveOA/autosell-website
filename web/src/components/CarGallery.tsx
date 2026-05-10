"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CarGallery({ images, title }: { images: string[]; title: string }) {
  const [i, setI] = useState(0);
  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-[#E2E6EA] bg-[#F4F6F8] text-sm text-[#6B7280]">
        No photos for this listing yet.
      </div>
    );
  }

  const main = images[i] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[#E2E6EA] bg-[#F4F6F8] shadow-sm">
        <Image
          src={main}
          alt={`${title} — photo ${i + 1}`}
          fill
          className="object-contain md:object-cover"
          sizes="(max-width:768px) 100vw, 896px"
          priority
          unoptimized={main.startsWith("http")}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#1A1F2E]/75 text-white shadow-md transition-colors hover:bg-[#1A1F2E]"
              onClick={() => setI((v) => (v - 1 + images.length) % images.length)}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#1A1F2E]/75 text-white shadow-md transition-colors hover:bg-[#1A1F2E]"
              onClick={() => setI((v) => (v + 1) % images.length)}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, idx) => (
            <button
              key={url + idx}
              type="button"
              onClick={() => setI(idx)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition-shadow ${
                idx === i ? "ring-[#E8500A] shadow-md" : "ring-transparent hover:ring-[#E2E6EA]"
              }`}
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
                unoptimized={url.startsWith("http")}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
