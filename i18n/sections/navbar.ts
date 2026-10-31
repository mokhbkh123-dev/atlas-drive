import type { Locale } from "../config";

const fr = {
  home: "Accueil",
  cars: "Véhicules",
  gallery: "Galerie",
  services: "Services",
  about: "À propos",
  contact: "Contact",
  book: "Réserver",
  menu: "Menu",
  close: "Fermer",
};

/**
 * Top navigation (header) strings.
 * Keys must stay in sync with the `fr` base dictionary.
 */
export const navbar: Record<Locale, typeof fr> = {
  fr,
  en: {
    home: "Home",
    cars: "Vehicles",
    gallery: "Gallery",
    services: "Services",
    about: "About",
    contact: "Contact",
    book: "Book now",
    menu: "Menu",
    close: "Close",
  },
  ar: {
    home: "الرئيسية",
    cars: "السيارات",
    gallery: "معرض الصور",
    services: "الخدمات",
    about: "من نحن",
    contact: "اتصل بنا",
    book: "احجز الآن",
    menu: "القائمة",
    close: "إغلاق",
  },
};
