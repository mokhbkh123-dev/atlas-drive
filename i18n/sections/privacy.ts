import type { Locale } from "../config";

const fr = {
  title: "Politique de confidentialité",
  paragraphs: [
    "ATLAS DRIVE s'engage à protéger la confidentialité de vos données personnelles.",
    "Cette politique est à valider par le propriétaire avant publication définitive.",
  ],
};

/**
 * Privacy page strings. French is copied verbatim from the page (source of truth).
 * Keys must stay in sync with the `fr` base dictionary.
 */
export const privacy: Record<Locale, typeof fr> = {
  fr,
  en: {
    title: "Privacy Policy",
    paragraphs: [
      "ATLAS DRIVE is committed to protecting the confidentiality of your personal data.",
      "This policy is subject to the owner's approval before final publication.",
    ],
  },
  ar: {
    title: "سياسة الخصوصية",
    paragraphs: [
      "تلتزم ATLAS DRIVE بحماية سرية بياناتك الشخصية.",
      "تخضع هذه السياسة لاعتماد المالك قبل النشر النهائي.",
    ],
  },
};
