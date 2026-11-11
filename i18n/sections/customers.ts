import type { Locale } from "../config";

// Only the directory page lives under `list`: the untracked customer form reads
// top-level string keys with its own fallbacks, so nesting keeps the two apart.
const fr = {
  list: {
    title: "Clients",
    new: "Nouveau client",
    empty: "Aucun client trouvé",
    columns: {
      name: "Nom",
      phone: "Téléphone",
      email: "E-mail",
      lastBooking: "Dernière réservation",
      added: "Ajouté le",
    },
  },
};

/**
 * Customer CRM (directory, profile).
 * Keys must stay in sync with the `fr` base dictionary.
 */
export const customers: Record<Locale, typeof fr> = {
  fr,
  en: {
    list: {
      title: "Customers",
      new: "Add customer",
      empty: "No customers found",
      columns: {
        name: "Name",
        phone: "Phone",
        email: "Email",
        lastBooking: "Last booking",
        added: "Added",
      },
    },
  },
  ar: {
    list: {
      title: "العملاء",
      new: "إضافة عميل",
      empty: "لا يوجد أي عميل",
      columns: {
        name: "الاسم",
        phone: "الهاتف",
        email: "البريد الإلكتروني",
        lastBooking: "آخر حجز",
        added: "تاريخ الإضافة",
      },
    },
  },
};
