import type { Locale } from "../config";

const fr = {
  tagline:
    "Location de voitures au Maroc. Service professionnel et fiable pour tous vos déplacements.",
  navigation: "Navigation",
  information: "Informations",
  contact: "Contact",
  home: "Accueil",
  cars: "Véhicules",
  gallery: "Galerie",
  services: "Services",
  about: "À propos",
  contactLink: "Contact",
  faq: "FAQ",
  terms: "Conditions générales",
  privacy: "Politique de confidentialité",
  address: "Casablanca, Maroc",
  rights: "Tous droits réservés.",
};

/**
 * Footer strings.
 * Keys must stay in sync with the `fr` base dictionary.
 */
export const footer: Record<Locale, typeof fr> = {
  fr,
  en: {
    tagline:
      "Car rental in Morocco. Professional and reliable service for all your journeys.",
    navigation: "Navigation",
    information: "Information",
    contact: "Contact",
    home: "Home",
    cars: "Vehicles",
    gallery: "Gallery",
    services: "Services",
    about: "About",
    contactLink: "Contact",
    faq: "FAQ",
    terms: "Terms and conditions",
    privacy: "Privacy policy",
    address: "Casablanca, Morocco",
    rights: "All rights reserved.",
  },
  ar: {
    tagline:
      "تأجير السيارات في المغرب. مهني وموثوق لكل رحلاتك.",
    navigation: "التنقل",
    information: "معلومات",
    contact: "اتصل بنا",
    home: "الرئيسية",
    cars: "السيارات",
    gallery: "معرض الصور",
    services: "الخدمات",
    about: "من نحن",
    contactLink: "اتصل بنا",
    faq: "الأسئلة الشائعة",
    terms: "الشروط والأحكام",
    privacy: "سياسة الخصوصية",
    address: "الدار البيضاء، المغرب",
    rights: "جميع الحقوق محفوظة.",
  },
};
