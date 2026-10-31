import type { Locale } from "../config";

const fr = {
  // --- Liste des véhicules (app/[lang]/cars/page.tsx) ---
  eyebrow: "Notre Collection",
  fleetTitle: "FLOTTE",
  fleetHighlight: "PREMIUM",
  tagline: "Puissance • Prestige • Performance",
  empty: "Aucun véhicule disponible pour le moment.",
  seatsCount: "{seats} Places",
  perDay: "/ jour",
  details: "Détails",
  filterActive: "Filtre actif",
  clearFilter: "Tout afficher",
  priceUpTo: "Jusqu'à {price}/jour",
  // --- Fiche véhicule (app/[lang]/cars/[slug]/page.tsx) ---
  backToFleet: "Retour à la flotte",
  perDayLong: "par jour",
  specs: {
    heading: "Caractéristiques",
    transmission: "Transmission",
    fuel: "Carburant",
    seats: "Places",
    doors: "Portes",
  },
  descriptionHeading: "Description",
  bookCta: "RÉSERVER CE VÉHICULE",
};

/**
 * Vehicle listing + vehicle detail pages.
 * Keys must stay in sync with the "fr" base dictionary.
 */
export const cars: Record<Locale, typeof fr> = {
  fr,
  en: {
    eyebrow: "Our Collection",
    fleetTitle: "FLEET",
    fleetHighlight: "PREMIUM",
    tagline: "Power • Prestige • Performance",
    empty: "No vehicles available at the moment.",
    seatsCount: "{seats} seats",
    perDay: "/ day",
    details: "Details",
    filterActive: "Active filter",
    clearFilter: "Show all",
    priceUpTo: "Up to {price}/day",
    backToFleet: "Back to the fleet",
    perDayLong: "per day",
    specs: {
      heading: "Specifications",
      transmission: "Transmission",
      fuel: "Fuel",
      seats: "Seats",
      doors: "Doors",
    },
    descriptionHeading: "Description",
    bookCta: "BOOK THIS VEHICLE",
  },
  ar: {
    eyebrow: "مجموعتنا",
    fleetTitle: "الأسطول",
    fleetHighlight: "الفاخر",
    tagline: "قوة • فخامة • أداء",
    empty: "لا توجد سيارات متاحة حاليًا.",
    seatsCount: "{seats} مقاعد",
    perDay: "/ يوم",
    details: "التفاصيل",
    filterActive: "التصفية النشطة",
    clearFilter: "عرض الكل",
    priceUpTo: "حتى {price}/يوم",
    backToFleet: "العودة إلى الأسطول",
    perDayLong: "لليوم",
    specs: {
      heading: "المواصفات",
      transmission: "ناقل الحركة",
      fuel: "الوقود",
      seats: "المقاعد",
      doors: "الأبواب",
    },
    descriptionHeading: "الوصف",
    bookCta: "احجز هذه السيارة",
  },
};
