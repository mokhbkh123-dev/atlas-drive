import type { Locale } from "../config";

const fr = {
  error: "Une erreur est survenue",
  switchLanguage: "Changer de langue",
};

/**
 * Strings shared across the whole app.
 * Keys must stay in sync with the `fr` base dictionary.
 */
export const common: Record<Locale, typeof fr> = {
  fr,
  en: {
    error: "Something went wrong",
    switchLanguage: "Change language",
  },
  ar: {
    error: "حدث خطأ ما",
    switchLanguage: "تغيير اللغة",
  },
};
