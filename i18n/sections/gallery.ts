import type { Locale } from "../config";

const fr = {
  eyebrow: "Galerie",
  title: "NOTRE",
  titleHighlight: "UNIVERS",
  subtitle: "Plongez dans l'élégance et la puissance de notre collection",
  cta: "Réserver un véhicule",
};

/**
 * Gallery page (`app/[lang]/gallery/page.tsx`).
 * Keys must stay in sync with the "fr" base dictionary.
 */
export const gallery: Record<Locale, typeof fr> = {
  fr,
  en: {
    eyebrow: "Gallery",
    title: "OUR",
    titleHighlight: "UNIVERSE",
    subtitle: "Immerse yourself in the elegance and power of our collection",
    cta: "Book a vehicle",
  },
  ar: {
    eyebrow: "معرض الصور",
    title: "اكتشف",
    titleHighlight: "عالمنا",
    subtitle: "اغمس في أناقة وقوة مجموعتنا",
    cta: "احجز سيارة",
  },
};
