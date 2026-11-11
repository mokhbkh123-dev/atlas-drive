import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { publicAsset } from "@/lib/site-images";
import type { Locale } from "@/i18n";

export type DestinationItem = {
  slug: string;
  name: string;
  tagline: string;
  desc: string;
  road: string;
};

/**
 * Destination tile. When `/public/destinations/<slug>.jpg` has not been added
 * yet, the tile falls back to a Moroccan-tinted panel instead of a broken image.
 */
export default function DestinationCard({
  item,
  lang,
  ctaLabel,
  variant = "grid",
}: {
  item: DestinationItem;
  lang: Locale;
  ctaLabel: string;
  variant?: "grid" | "compact";
}) {
  const image = publicAsset(`/destinations/${item.slug}.jpg`);

  return (
    <Link
      href={`/${lang}/destinations#${item.slug}`}
      className={`card-site card-hover group relative block overflow-hidden ${
        variant === "compact" ? "aspect-[4/3]" : "aspect-[16/11]"
      }`}
    >
      {image ? (
        <img
          src={image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
      ) : (
        <span
          aria-hidden
          className="zellige absolute inset-0 bg-gradient-to-br from-forest-soft via-forest to-forest-deep"
        />
      )}

      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
      />

      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
        <span>
          <span className="block font-display text-lg font-bold text-white sm:text-xl">
            {item.name}
          </span>
          <span className="mt-1 block text-xs font-medium text-bronze-light">
            {item.tagline}
          </span>
        </span>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/35 text-white transition-colors group-hover:border-bronze-light group-hover:bg-bronze group-hover:text-bronze-foreground">
          <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        </span>
      </span>
    </Link>
  );
}
