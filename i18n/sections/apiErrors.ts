import type { Locale } from "../config";

/**
 * User-facing messages for errors returned by the API.
 * API routes return a machine-readable `code` alongside the
 * French `error` message; clients look the code up here so the
 * message is shown in the visitor's language.
 */
const fr = {
  REQUIRED_FIELDS: "Tous les champs obligatoires doivent être remplis",
  INVALID_DATES:
    "La date de retour doit être postérieure à la date de prise en charge",
  CAR_UNAVAILABLE: "Véhicule non disponible",
  CAR_NOT_AVAILABLE_DATES:
    "Ce véhicule n'est pas disponible pour ces dates",
  MISSING_FIELDS: "Champs obligatoires manquants",
  INVALID_STATUS: "Statut invalide",
  BOOKING_NOT_FOUND: "Réservation introuvable",
  BOOKING_CONFLICT:
    "Conflit de réservation - ce véhicule est déjà réservé sur cette période",
  FIELD_TOO_LONG: "Un champ dépasse la longueur autorisée",
  INVALID_SETTING_VALUE: "Valeur de paramètre invalide",
  INVALID_AMOUNT: "Montant invalide",
  INVALID_PAYMENT_METHOD: "Mode de paiement invalide",
  FUTURE_PAYMENT_DATE: "La date de paiement ne peut pas être future",
  AMOUNT_EXCEEDS_REMAINING: "Le paiement dépasse le reste à encaisser",
  PAYMENT_NOT_ALLOWED: "Aucun paiement sur une réservation annulée",
  SERVER_ERROR: "Erreur serveur",
  GENERIC_ERROR: "Erreur",
};

/**
 * Keys must stay in sync with the `fr` base dictionary and with the
 * `code` values returned by the API routes.
 */
export const apiErrors: Record<Locale, typeof fr> = {
  fr,
  en: {
    REQUIRED_FIELDS: "All required fields must be filled in",
    INVALID_DATES: "The return date must be after the pickup date",
    CAR_UNAVAILABLE: "Vehicle unavailable",
    CAR_NOT_AVAILABLE_DATES: "This vehicle is not available for these dates",
    MISSING_FIELDS: "Required fields are missing",
    INVALID_STATUS: "Invalid status",
    BOOKING_NOT_FOUND: "Booking not found",
    BOOKING_CONFLICT:
      "Booking conflict - this vehicle is already booked for this period",
    FIELD_TOO_LONG: "A field exceeds the allowed length",
    INVALID_SETTING_VALUE: "Invalid setting value",
    INVALID_AMOUNT: "Invalid amount",
    INVALID_PAYMENT_METHOD: "Invalid payment method",
    FUTURE_PAYMENT_DATE: "The payment date cannot be in the future",
    AMOUNT_EXCEEDS_REMAINING: "The payment exceeds the remaining balance",
    PAYMENT_NOT_ALLOWED: "No payment on a cancelled booking",
    SERVER_ERROR: "Server error",
    GENERIC_ERROR: "Error",
  },
  ar: {
    REQUIRED_FIELDS: "يجب ملء جميع الحقول المطلوبة",
    INVALID_DATES: "يجب أن يكون تاريخ العودة بعد تاريخ الاستلام",
    CAR_UNAVAILABLE: "السيارة غير متاحة",
    CAR_NOT_AVAILABLE_DATES: "هذه السيارة غير متاحة لهذه التواريخ",
    MISSING_FIELDS: "حقول مطلوبة مفقودة",
    INVALID_STATUS: "حالة غير صالحة",
    BOOKING_NOT_FOUND: "الحجز غير موجود",
    BOOKING_CONFLICT:
      "تعارض في الحجز - هذه السيارة محجوزة بالفعل في هذه الفترة",
    FIELD_TOO_LONG: "أحد الحقول يتجاوز الطول المسموح",
    INVALID_SETTING_VALUE: "قيمة الإعداد غير صالحة",
    INVALID_AMOUNT: "مبلغ غير صالح",
    INVALID_PAYMENT_METHOD: "طريقة أداء غير صالحة",
    FUTURE_PAYMENT_DATE: "لا يمكن أن يكون تاريخ الأداء مستقبلياً",
    AMOUNT_EXCEEDS_REMAINING: "المبلغ يتجاوز المتبقي من الحجز",
    PAYMENT_NOT_ALLOWED: "لا يوجد أداء في حجز ملغى",
    SERVER_ERROR: "خطأ في الخادم",
    GENERIC_ERROR: "خطأ",
  },
};
