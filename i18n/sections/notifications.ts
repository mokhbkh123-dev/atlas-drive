import type { Locale } from "../config";

const fr = {
  title: "Notifications",
  empty: "Aucune notification",
  markAllRead: "Tout marquer comme lu",
  filters: {
    all: "Toutes",
    unread: "Non lues",
  },
  types: {
    pickup_today: "Prélèvement prévu aujourd'hui",
    return_today: "Retour prévu aujourd'hui",
    overdue: "Véhicule en retard",
    maintenance_today: "Maintenance prévue aujourd'hui",
    pending_confirmation: "Réservation en attente de confirmation",
    booking_created: "Nouvelle réservation",
    booking_confirmed: "Réservation confirmée",
    booking_cancelled: "Réservation annulée",
    booking_rejected: "Réservation refusée",
    payment_recorded: "Paiement enregistré",
  },
};

/**
 * Notification center (bell + /admin notifications page).
 * Keys must stay in sync with the `fr` base dictionary.
 */
export const notifications: Record<Locale, typeof fr> = {
  fr,
  en: {
    title: "Notifications",
    empty: "No notifications",
    markAllRead: "Mark all as read",
    filters: {
      all: "All",
      unread: "Unread",
    },
    types: {
      pickup_today: "Pickup scheduled today",
      return_today: "Return scheduled today",
      overdue: "Vehicle overdue",
      maintenance_today: "Maintenance due today",
      pending_confirmation: "Reservation awaiting confirmation",
      booking_created: "New reservation",
      booking_confirmed: "Reservation confirmed",
      booking_cancelled: "Reservation cancelled",
      booking_rejected: "Reservation rejected",
      payment_recorded: "Payment recorded",
    },
  },
  ar: {
    title: "الإشعارات",
    empty: "لا توجد إشعارات",
    markAllRead: "تحديد الكل كمقروء",
    filters: {
      all: "الكل",
      unread: "غير مقروءة",
    },
    types: {
      pickup_today: "استلام مبرمج اليوم",
      return_today: "إعادة مبرمجة اليوم",
      overdue: "مركبة متأخرة",
      maintenance_today: "صيانة مستحقة اليوم",
      pending_confirmation: "حجز بانتظار التأكيد",
      booking_created: "حجز جديد",
      booking_confirmed: "تم تأكيد الحجز",
      booking_cancelled: "تم إلغاء الحجز",
      booking_rejected: "تم رفض الحجز",
      payment_recorded: "تم تسجيل دفعة",
    },
  },
};
