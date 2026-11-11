"use client";

import { useState } from "react";
import { CarFront } from "lucide-react";

export type GalleryImage = { src: string; alt: string };

export default function CarGallery({
  images,
  label,
}: {
  images: GalleryImage[];
  label: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="card-site relative aspect-[16/10] w-full overflow-hidden">
        {current ? (
          <img
            key={current.src}
            src={current.src}
            alt={current.alt || label}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        ) : (
          <div
            role="img"
            aria-label={label}
            className="zellige absolute inset-0 flex items-center justify-center bg-forest"
          >
            <CarFront className="h-14 w-14 text-bronze-light/70" aria-hidden />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${label} — ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg border transition-colors ${
                index === active
                  ? "border-bronze"
                  : "border-line hover:border-line-strong"
              }`}
            >
              <img
                src={image.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
