import type { Locale } from "../config";

const fr = {
  title: "Conditions générales de location",
  paragraphs: [
    "Les présentes conditions générales s'appliquent à l'utilisation des services d'ATLAS DRIVE.",
    "Ces conditions sont à valider par le propriétaire avant publication définitive.",
  ],
};

/**
 * Terms page strings. French is copied verbatim from the page (source of truth).
 * Keys must stay in sync with the `fr` base dictionary.
 */
export const terms: Record<Locale, typeof fr> = {
  fr,
  en: {
    title: "General Rental Terms and Conditions",
    paragraphs: [
      "These general terms and conditions apply to the use of ATLAS DRIVE's services.",
      "These terms are subject to the owner's approval before final publication.",
    ],
  },
  ar: {
    title: "الشروط العامة للإيجار",
    paragraphs: [
      "تنطبق هذه الشروط العامة على استخدام خدمات ATLAS DRIVE.",
      "يخضع اعتماد هذه الشروط من قبل المالك قبل النشر النهائي.",
    ],
  },
};
