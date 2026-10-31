import type { Locale } from "../config";

const fr = {
  /** Car.category values stored in the DB (French canonical values). */
  category: {
    Sport: "Sport",
    SUV: "SUV",
    Berline: "Berline",
    Supercar: "Supercar",
  },
  /** Car.transmission values stored in the DB. */
  transmission: {
    Automatique: "Automatique",
    Manuelle: "Manuelle",
  },
  /** Car.fuelType values stored in the DB. */
  fuel: {
    Essence: "Essence",
    Diesel: "Diesel",
    Hybride: "Hybride",
    "Électrique": "Électrique",
  },
  /** Booking.status enum values. */
  bookingStatus: {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    READY_FOR_PICKUP: "Prête au départ",
    REJECTED: "Refusée",
    CANCELLED: "Annulée",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminée",
  },
  /** Car.status enum values. */
  carStatus: {
    DRAFT: "Brouillon",
    PUBLISHED: "Publié",
    ARCHIVED: "Archivé",
  },
  /** Booking.source enum values. */
  bookingSource: {
    WEB: "Site web",
    ADMIN: "Administration",
    PHONE: "Téléphone",
    WALK_IN: "Sur place",
  },
  /** Payment.status enum values. */
  paymentStatus: {
    PENDING: "En attente",
    PAID: "Payé",
    PARTIAL: "Partiel",
    FAILED: "Échoué",
    REFUNDED: "Remboursé",
    PARTIAL_REFUND: "Remboursement partiel",
  },
  /** Payment.method / Expense.paymentMethod values. */
  paymentMethod: {
    CASH: "Espèces",
    BANK_TRANSFER: "Virement",
    CARD: "Carte",
    CHECK: "Chèque",
    OTHER: "Autre",
  },
  /** Invoice.status enum values. */
  invoiceStatus: {
    DRAFT: "Brouillon",
    ISSUED: "Émise",
    PAID: "Payée",
    VOID: "Annulée",
  },
  /** Maintenance.type values. */
  maintenanceType: {
    OIL: "Vidange",
    TIRE: "Pneus",
    INSPECTION: "Inspection",
    REPAIR: "Réparation",
    INSURANCE: "Assurance",
    REGISTRATION: "Carte grise",
    OTHER: "Autre",
  },
  /** Maintenance.status values. */
  maintenanceStatus: {
    SCHEDULED: "Planifiée",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
  },
  /** Expense.category values. */
  expenseCategory: {
    SERVICE: "Entretien",
    FUEL: "Carburant",
    INSURANCE: "Assurance",
    TAXES: "Taxes",
    PARKING: "Stationnement",
    CLEANING: "Nettoyage",
    TOWING: "Remorquage",
    OTHER: "Autre",
  },
  /** User.role enum values. */
  role: {
    SUPER_ADMIN: "Super administrateur",
    MANAGER: "Gérant",
    FLEET_MANAGER: "Gestionnaire de flotte",
    AGENT: "Agent",
    FINANCE: "Comptable",
  },
};

/**
 * Translation maps for values that live in the database
 * (categories, transmission, fuel, booking/car statuses).
 * Use `tEnum(dict, group, value)` to look a value up safely —
 * unknown values fall through unchanged.
 */
export const enums: Record<Locale, typeof fr> = {
  fr,
  en: {
    category: {
      Sport: "Sport",
      SUV: "SUV",
      Berline: "Sedan",
      Supercar: "Supercar",
    },
    transmission: {
      Automatique: "Automatic",
      Manuelle: "Manual",
    },
    fuel: {
      Essence: "Petrol",
      Diesel: "Diesel",
      Hybride: "Hybrid",
      "Électrique": "Electric",
    },
    bookingStatus: {
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      READY_FOR_PICKUP: "Ready for pickup",
      REJECTED: "Rejected",
      CANCELLED: "Cancelled",
      IN_PROGRESS: "In progress",
      COMPLETED: "Completed",
    },
    carStatus: {
      DRAFT: "Draft",
      PUBLISHED: "Published",
      ARCHIVED: "Archived",
    },
    bookingSource: {
      WEB: "Website",
      ADMIN: "Admin panel",
      PHONE: "Phone",
      WALK_IN: "Walk-in",
    },
    paymentStatus: {
      PENDING: "Pending",
      PAID: "Paid",
      PARTIAL: "Partial",
      FAILED: "Failed",
      REFUNDED: "Refunded",
      PARTIAL_REFUND: "Partial refund",
    },
    paymentMethod: {
      CASH: "Cash",
      BANK_TRANSFER: "Bank transfer",
      CARD: "Card",
      CHECK: "Check",
      OTHER: "Other",
    },
    invoiceStatus: {
      DRAFT: "Draft",
      ISSUED: "Issued",
      PAID: "Paid",
      VOID: "Void",
    },
    maintenanceType: {
      OIL: "Oil change",
      TIRE: "Tires",
      INSPECTION: "Inspection",
      REPAIR: "Repair",
      INSURANCE: "Insurance",
      REGISTRATION: "Registration",
      OTHER: "Other",
    },
    maintenanceStatus: {
      SCHEDULED: "Scheduled",
      IN_PROGRESS: "In progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    },
    expenseCategory: {
      SERVICE: "Service",
      FUEL: "Fuel",
      INSURANCE: "Insurance",
      TAXES: "Taxes",
      PARKING: "Parking",
      CLEANING: "Cleaning",
      TOWING: "Towing",
      OTHER: "Other",
    },
    role: {
      SUPER_ADMIN: "Super admin",
      MANAGER: "Manager",
      FLEET_MANAGER: "Fleet manager",
      AGENT: "Agent",
      FINANCE: "Accountant",
    },
  },
  ar: {
    category: {
      Sport: "رياضية",
      SUV: "دفع رباعي",
      Berline: "سيدان",
      Supercar: "سيارة خارقة",
    },
    transmission: {
      Automatique: "أوتوماتيك",
      Manuelle: "يدوي",
    },
    fuel: {
      Essence: "بنزين",
      Diesel: "ديزل",
      Hybride: "هجين",
      "Électrique": "كهربائي",
    },
    bookingStatus: {
      PENDING: "قيد الانتظار",
      CONFIRMED: "مؤكد",
      READY_FOR_PICKUP: "جاهز للاستلام",
      REJECTED: "مرفوض",
      CANCELLED: "ملغى",
      IN_PROGRESS: "قيد التنفيذ",
      COMPLETED: "مكتمل",
    },
    carStatus: {
      DRAFT: "مسودة",
      PUBLISHED: "منشور",
      ARCHIVED: "مؤرشف",
    },
    bookingSource: {
      WEB: "الموقع",
      ADMIN: "لوحة الإدارة",
      PHONE: "هاتف",
      WALK_IN: "حضور مباشر",
    },
    paymentStatus: {
      PENDING: "قيد الانتظار",
      PAID: "مدفوع",
      PARTIAL: "جزئي",
      FAILED: "فشل",
      REFUNDED: "مسترد",
      PARTIAL_REFUND: "استرداد جزئي",
    },
    paymentMethod: {
      CASH: "نقدًا",
      BANK_TRANSFER: "تحويل بنكي",
      CARD: "بطاقة",
      CHECK: "شيك",
      OTHER: "أخرى",
    },
    invoiceStatus: {
      DRAFT: "مسودة",
      ISSUED: "صادرة",
      PAID: "مدفوعة",
      VOID: "ملغاة",
    },
    maintenanceType: {
      OIL: "تغيير الزيت",
      TIRE: "الإطارات",
      INSPECTION: "فحص",
      REPAIR: "إصلاح",
      INSURANCE: "تأمين",
      REGISTRATION: "بطاقة الرسوم",
      OTHER: "أخرى",
    },
    maintenanceStatus: {
      SCHEDULED: "مبرمج",
      IN_PROGRESS: "قيد التنفيذ",
      COMPLETED: "منجز",
      CANCELLED: "ملغى",
    },
    expenseCategory: {
      SERVICE: "صيانة",
      FUEL: "وقود",
      INSURANCE: "تأمين",
      TAXES: "ضرائب",
      PARKING: "موقف",
      CLEANING: "تنظيف",
      TOWING: "جر",
      OTHER: "أخرى",
    },
    role: {
      SUPER_ADMIN: "مشرف عام",
      MANAGER: "مسير",
      FLEET_MANAGER: "مسير الأسطول",
      AGENT: "وكيل",
      FINANCE: "محاسب",
    },
  },
};
