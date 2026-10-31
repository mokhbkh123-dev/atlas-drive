"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/admin/ui";
import type { CarFormImage } from "./types";
import Image from "next/image";

export function CarGallery({
  images,
}: {
  images: CarFormImage[];
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const current = images[active];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gallery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
          {current.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.url}
              alt={current.alt || "Vehicle image"}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        {images.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActive(idx)}
                className={`relative h-16 w-24 overflow-hidden rounded-md border ${
                  idx === active ? "border-admin-navy ring-2 ring-admin-navy/20" : "border-admin-line"
                }`}
              >
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.url}
                    alt={img.alt || "Thumbnail"}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
