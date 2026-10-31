export const locales = ["fr", "en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const hasLocale = (locale: string): locale is Locale =>
  (locales as readonly string[]).includes(locale);

/** Text direction per locale (Arabic is full RTL). */
export const dirOf: Record<Locale, "ltr" | "rtl"> = {
  fr: "ltr",
  en: "ltr",
  ar: "rtl",
};

/** BCP-47 tag used for Intl date/number formatting. */
export const intlLocaleOf: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-US",
  ar: "ar-MA",
};

/** Language names, always displayed in their own language. */
export const languageNames: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};
