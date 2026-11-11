"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type HeroSlide = {
  id: string;
  imageUrl: string | null;
  alt: string;
  name: string;
  href: string;
};

/**
 * Home hero. The headline stays fixed while the background rotates through the
 * published fleet, matching the mockup's arrow carousel.
 */
export default function HeroCarousel({
  slides,
  fallbackImage,
  children,
}: {
  slides: HeroSlide[];
  fallbackImage: string;
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);

  const count = slides.length;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) setAuto(false);
  }, []);

  useEffect(() => {
    if (!auto || count < 2) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % count);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [auto, count]);

  if (count === 0) {
    return (
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url('${fallbackImage}')` }}
      />
    );
  }

  const go = (next: number) => {
    setAuto(false);
    setIndex(((next % count) + count) % count);
  };

  return (
    <>
      <div className="absolute inset-0 -z-10 overflow-hidden bg-forest-deep">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.id}
            aria-hidden={slideIndex !== index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              slideIndex === index ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.imageUrl ? (
              <img
                src={slide.imageUrl}
                alt={slide.alt}
                loading={slideIndex === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover object-[70%_50%] lg:object-[60%_50%]"
              />
            ) : (
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${fallbackImage}')` }}
              />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/95 via-forest-deep/70 to-forest-deep/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-transparent to-forest-deep/30" />
      </div>

      {count > 1 && (
        <div className="pointer-events-none absolute inset-y-0 start-0 end-0 z-10 hidden items-center justify-between px-3 sm:px-6 lg:flex">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur transition-colors hover:border-bronze-light hover:bg-bronze hover:text-bronze-foreground"
          >
            <ChevronLeft className="h-5 w-5 rtl:-scale-x-100" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur transition-colors hover:border-bronze-light hover:bg-bronze hover:text-bronze-foreground"
          >
            <ChevronRight className="h-5 w-5 rtl:-scale-x-100" aria-hidden />
          </button>
        </div>
      )}

      {count > 1 && (
        <div className="absolute bottom-20 start-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => go(slideIndex)}
              aria-label={slide.name}
              aria-current={slideIndex === index ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all ${
                slideIndex === index ? "w-8 bg-bronze-light" : "w-3 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* The active vehicle is offered as a caption under the headline. */}
      <Link
        href={slides[index].href}
        className="absolute bottom-20 end-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/85 backdrop-blur transition-colors hover:border-bronze-light hover:text-bronze-light sm:end-6"
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-bronze-light" />
        {slides[index].name}
      </Link>

      {children}
    </>
  );
}
