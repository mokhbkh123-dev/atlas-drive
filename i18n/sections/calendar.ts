import type { Locale } from "../config";

const fr = {
  title: "Calendrier",
  subtitle: "Vue d'ensemble des réservations par date de prise en charge",
  empty: "Aucune réservation à afficher",
  pickup: "Prise en charge",
  return: "Retour",
};

/**
 * Reservation calendar (day/week/month views).
 * Keys must stay in sync with the `fr` base dictionary.
 */
export const calendar: Record<Locale, typeof fr> = {
  fr,
  en: {
    title: "Calendar",
    subtitle: "All reservations ordered by pickup date",
    empty: "No reservation to display",
    pickup: "Pickup",
    return: "Return",
  },
  ar: {
    title: "التقويم",
    subtitle: "عرض جميع الحجوزات حسب تاريخ الاستلام",
    empty: "لا توجد حجوزات للعرض",
    pickup: "الاستلام",
    return: "العودة",
  },
};
