import type { Locale } from "../config";

const fr = {
  error: "Une erreur est survenue",
  switchLanguage: "Changer de langue",
  sortByName: "Nom (A - Z)",
  themeToDark: "Passer en mode nuit",
  themeToLight: "Passer en mode jour",
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
    sortByName: "Name (A - Z)",
    themeToDark: "Switch to night mode",
    themeToLight: "Switch to day mode",
  },
  ar: {
    error: "حدث خطأ ما",
    switchLanguage: "تغيير اللغة",
    sortByName: "الاسم (أ - ي)",
    themeToDark: "التبديل إلى الوضع الليلي",
    themeToLight: "التبديل إلى الوضع النهاري",
  },
};
