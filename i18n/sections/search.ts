import type { Locale } from "../config";

const fr = {
  title: "Recherche",
  pickupLocation: "Lieu de prise en charge",
  pickupDate: "Date de prise en charge",
  returnDate: "Date de retour",
  swapDates: "Inverser les dates",
  carType: "Type de véhicule",
  anyCity: "Toutes les villes",
  anyCar: "Tous les véhicules",
  submit: "Rechercher",
  resultsFor: "Résultats pour",
  noResults:
    "Aucun véhicule ne correspond à cette recherche. Ajustez les filtres ou contactez-nous, nous trouvons souvent une alternative.",
  clearAll: "Effacer la recherche",
};

/**
 * Rental search bar (home page, destinations band and the `Book Your Ride`
 * strip on the vehicle detail page).
 * Keys must stay in sync with the "fr" base dictionary.
 */
export const search: Record<Locale, typeof fr> = {
  fr,
  en: {
    title: "Search",
    pickupLocation: "Pick-up location",
    pickupDate: "Pick-up date",
    returnDate: "Drop-off date",
    swapDates: "Swap dates",
    carType: "Car type",
    anyCity: "All cities",
    anyCar: "All cars",
    submit: "Search",
    resultsFor: "Results for",
    noResults:
      "No vehicle matches this search. Adjust the filters or contact us, we often find an alternative.",
    clearAll: "Clear search",
  },
  ar: {
    title: "البحث",
    pickupLocation: "مكان الاستلام",
    pickupDate: "تاريخ الاستلام",
    returnDate: "تاريخ الإرجاع",
    swapDates: "تبديل التاريخين",
    carType: "نوع السيارة",
    anyCity: "كل المدن",
    anyCar: "كل السيارات",
    submit: "بحث",
    resultsFor: "نتائج",
    noResults:
      "لا توجد سيارة مطابقة لهذا البحث. عدّل عوامل التصفية أو تواصل معنا، وغالبًا ما نجد بديلًا مناسبًا.",
    clearAll: "مسح البحث",
  },
};
