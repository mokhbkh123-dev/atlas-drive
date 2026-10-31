import type { Locale } from "../config";

const fr = {
  eyebrow: "Contact",
  title: "PRENEZ",
  titleHighlight: "CONTACT",
  subtitle: "Nous sommes à votre écoute pour toute demande",
  addressLabel: "Adresse",
  addressValue: "Casablanca, Maroc",
  emailLabel: "Email",
  emailValue: "contact@atlasdrive.ma",
  hoursLabel: "Horaires",
  hoursValue: "Lundi - Dimanche : 9h00 - 21h00",
};

/**
 * Contact page (`app/[lang]/contact/page.tsx`).
 * Keys must stay in sync with the "fr" base dictionary.
 */
export const contact: Record<Locale, typeof fr> = {
  fr,
  en: {
    eyebrow: "Contact",
    title: "GET IN",
    titleHighlight: "TOUCH",
    subtitle: "We are here to help with any enquiry",
    addressLabel: "Address",
    addressValue: "Casablanca, Morocco",
    emailLabel: "Email",
    emailValue: "contact@atlasdrive.ma",
    hoursLabel: "Opening hours",
    hoursValue: "Monday - Sunday: 9:00 AM - 9:00 PM",
  },
  ar: {
    eyebrow: "اتصل بنا",
    title: "تواصل",
    titleHighlight: "معنا",
    subtitle: "نحن في خدمتكم لأي استفسار",
    addressLabel: "العنوان",
    addressValue: "الدار البيضاء، المغرب",
    emailLabel: "البريد الإلكتروني",
    emailValue: "contact@atlasdrive.ma",
    hoursLabel: "ساعات العمل",
    hoursValue: "الاثنين - الأحد: 9:00 - 21:00",
  },
};
