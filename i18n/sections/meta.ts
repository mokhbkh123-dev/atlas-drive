import type { Locale } from "../config";

const fr = {
  title: "ATLAS DRIVE - Location de voitures au Maroc",
  description: "Plateforme professionnelle de location de voitures au Maroc",
};

/**
 * Site-wide <head> metadata (title / description).
 * Keys must stay in sync with the `fr` base dictionary.
 */
export const meta: Record<Locale, typeof fr> = {
  fr,
  en: {
    title: "ATLAS DRIVE - Car Rental in Morocco",
    description: "Professional car rental platform in Morocco",
  },
  ar: {
    title: "ATLAS DRIVE - تأجير السيارات في المغرب",
    description: "منصة احترافية لتأجير السيارات في المغرب",
  },
};
