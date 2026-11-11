import type { Locale } from "../config";

const fr = {
  title: "Agences",
  subtitle:
    "Chaque agence définit une ville de prise en charge ; le site public ne propose ces villes au filtre de la flotte que si un véhicule y est rattaché.",
  add: "Nouvelle agence",
  empty:
    "Aucune agence enregistrée. Le formulaire de réservation peut toujours recevoir une ville libre, mais la liste des véhicules ne peut pas filtrer par lieu.",
  columns: {
    agency: "Agence",
    city: "Ville",
    contact: "Contact",
    cars: "Véhicules",
    status: "Statut",
    actions: "Actions",
  },
  fields: {
    name: "Nom de l'agence",
    city: "Ville",
    address: "Adresse",
    phone: "Téléphone",
    email: "E-mail",
    primary: "Agence principale",
    active: "Proposée sur le site",
  },
  hints: {
    name: "Telle qu'elle s'affiche dans la réservation et la fiche véhicule.",
    city: "Valeur reprise par le filtre de prise en charge.",
    primary: "Une seule agence principale ; l'enregistrer ici retire ce statut aux autres.",
    active: "Une agence masquée reste rattachée aux véhicules déjà enregistrés.",
    carsAttached: "{count} véhicule rattaché",
    carsAttachedPlural: "{count} véhicules rattachés",
    detachWarning:
      "Les {count} véhicules rattachés resteront en flotte, sans agence.",
  },
  status: {
    visible: "En ligne",
    hidden: "Masquée",
  },
  actions: {
    edit: "Modifier",
    save: "Enregistrer",
    create: "Ajouter",
    cancel: "Annuler",
    remove: "Supprimer",
  },
  confirm: {
    title: "Supprimer cette agence ?",
    confirm: "Supprimer",
    cancel: "Annuler",
  },
  messages: {
    created: "Agence ajoutée.",
    saved: "Agence mise à jour.",
    removed: "Agence supprimée.",
  },
  errors: {
    NAME_REQUIRED: "Le nom de l'agence est obligatoire.",
    CITY_REQUIRED: "Indiquez la ville de l'agence.",
    FIELD_TOO_LONG: "Un champ dépasse la longueur autorisée.",
    INVALID_EMAIL: "Adresse e-mail invalide.",
    INVALID_PHONE: "Numéro de téléphone invalide.",
    NOT_FOUND: "Cette agence n'existe plus.",
  },
};

/**
 * Admin locations (agencies) page.
 * Keys must stay in sync with the "fr" base dictionary.
 */
export const locations: Record<Locale, typeof fr> = {
  fr,
  en: {
    title: "Locations",
    subtitle:
      "Each location sets a pick-up city; the public site only offers those cities in the fleet filter when a vehicle is attached to one.",
    add: "New location",
    empty:
      "No location saved yet. The booking form still accepts a free-text city, but the vehicle list cannot filter by place.",
    columns: {
      agency: "Location",
      city: "City",
      contact: "Contact",
      cars: "Vehicles",
      status: "Status",
      actions: "Actions",
    },
    fields: {
      name: "Location name",
      city: "City",
      address: "Address",
      phone: "Phone",
      email: "Email",
      primary: "Main location",
      active: "Offered on the website",
    },
    hints: {
      name: "Shown as-is in the booking request and on the vehicle page.",
      city: "Reused by the pick-up location filter.",
      primary: "One main location only; saving this one clears the status on the others.",
      active: "A hidden location stays attached to the vehicles already linked to it.",
      carsAttached: "{count} vehicle attached",
      carsAttachedPlural: "{count} vehicles attached",
      detachWarning: "The {count} attached vehicles stay in the fleet, without a location.",
    },
    status: {
      visible: "Published",
      hidden: "Hidden",
    },
    actions: {
      edit: "Edit",
      save: "Save",
      create: "Add",
      cancel: "Cancel",
      remove: "Delete",
    },
    confirm: {
      title: "Delete this location?",
      confirm: "Delete",
      cancel: "Cancel",
    },
    messages: {
      created: "Location added.",
      saved: "Location updated.",
      removed: "Location deleted.",
    },
    errors: {
      NAME_REQUIRED: "The location name is required.",
      CITY_REQUIRED: "Enter the city of this location.",
      FIELD_TOO_LONG: "A field is longer than allowed.",
      INVALID_EMAIL: "Invalid email address.",
      INVALID_PHONE: "Invalid phone number.",
      NOT_FOUND: "This location no longer exists.",
    },
  },
  ar: {
    title: "الفروع",
    subtitle:
      "كل فرع يحدّد مدينة استلام؛ لا يقترح الموقع العام هذه المدن في تصفية الأسطول إلا إذا كانت سيارة مرتبطة بها.",
    add: "فرع جديد",
    empty:
      "لا يوجد فرع مسجَّل. يبقى نموذج الحجز يقبل مدينة مكتوبة يدويًا، لكن قائمة السيارات لا يمكنها التصفية حسب المكان.",
    columns: {
      agency: "الفرع",
      city: "المدينة",
      contact: "الاتصال",
      cars: "السيارات",
      status: "الحالة",
      actions: "الإجراءات",
    },
    fields: {
      name: "اسم الفرع",
      city: "المدينة",
      address: "العنوان",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      primary: "الفرع الرئيسي",
      active: "مقترح على الموقع",
    },
    hints: {
      name: "يظهر كما هو في طلب الحجز وفي صفحة السيارة.",
      city: "تستعمله تصفية مكان الاستلام.",
      primary: "فرع رئيسي واحد فقط؛ حفظ هذا الفرع يزيل هذه الصفة عن البقية.",
      active: "الفرع المخفي يبقى مرتبطًا بالسيارات المسجّلة عليه.",
      carsAttached: "{count} سيارة مرتبطة",
      carsAttachedPlural: "{count} سيارات مرتبطة",
      detachWarning: "ستبقى السيارات المرتبطة ({count}) في الأسطول دون فرع.",
    },
    status: {
      visible: "ظاهرة",
      hidden: "مخفية",
    },
    actions: {
      edit: "تعديل",
      save: "حفظ",
      create: "إضافة",
      cancel: "إلغاء",
      remove: "حذف",
    },
    confirm: {
      title: "حذف هذا الفرع؟",
      confirm: "حذف",
      cancel: "إلغاء",
    },
    messages: {
      created: "تمت إضافة الفرع.",
      saved: "تم تحديث الفرع.",
      removed: "تم حذف الفرع.",
    },
    errors: {
      NAME_REQUIRED: "اسم الفرع مطلوب.",
      CITY_REQUIRED: "أدخل مدينة الفرع.",
      FIELD_TOO_LONG: "أحد الحقول أطول من المسموح.",
      INVALID_EMAIL: "عنوان بريد إلكتروني غير صالح.",
      INVALID_PHONE: "رقم هاتف غير صالح.",
      NOT_FOUND: "هذا الفرع لم يعد موجودًا.",
    },
  },
};
