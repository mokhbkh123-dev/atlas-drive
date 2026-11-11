import type { Locale } from "../config";

const fr = {
  title: "Disponibilités",
  subtitle: "Disponibilité des véhicules selon les réservations en cours",
  available: "Disponible",
  booked: "Réservé",
  seats: "places",
  booking: "Réservation",
  pickup: "Prise en charge",
  return: "Retour",
  status: "Statut",
  empty: "Aucun véhicule publié",
  noBookings: "Aucune réservation à venir pour ce véhicule",
};

/**
 * Vehicle availability grid.
 * Keys must stay in sync with the `fr` base dictionary.
 */
export const availability: Record<Locale, typeof fr> = {
  fr,
  en: {
    title: "Availability",
    subtitle: "Vehicle availability based on current reservations",
    available: "Available",
    booked: "Booked",
    seats: "seats",
    booking: "Booking",
    pickup: "Pickup",
    return: "Return",
    status: "Status",
    empty: "No published vehicle",
    noBookings: "No upcoming reservation for this vehicle",
  },
  ar: {
    title: "التوفر",
    subtitle: "توفر المركبات حسب الحجوزات الجارية",
    available: "متوفرة",
    booked: "محجوزة",
    seats: "مقاعد",
    booking: "الحجز",
    pickup: "الاستلام",
    return: "العودة",
    status: "الحالة",
    empty: "لا توجد مركبات منشورة",
    noBookings: "لا يوجد حجز قادم لهذه المركبة",
  },
};
