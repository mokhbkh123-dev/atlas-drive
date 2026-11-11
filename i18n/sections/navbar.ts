import type { Locale } from "../config";

const fr = {
  home: "Accueil",
  cars: "Voitures",
  destinations: "Destinations",
  gallery: "Galerie",
  services: "Services",
  about: "À propos",
  contact: "Contact",
  book: "Réserver",
  menu: "Menu",
  close: "Fermer",
  logoTagline: "Explorez le Maroc",
};

/**
 * Top navigation (header) strings.
 * Keys must stay in sync with the `fr` base dictionary.
 */
export const navbar: Record<Locale, typeof fr> = {
  fr,
  en: {
    home: "Home",
    cars: "Cars",
    destinations: "Destinations",
    gallery: "Gallery",
    services: "Services",
    about: "About",
    contact: "Contact",
    book: "Book now",
    menu: "Menu",
    close: "Close",
    logoTagline: "Explore Morocco",
  },
  ar: {
    home: "الرئيسية",
    cars: "السيارات",
    destinations: "الوجهات",
    gallery: "معرض الصور",
    services: "الخدمات",
    about: "من نحن",
    contact: "اتصل بنا",
    book: "احجز الآن",
    menu: "القائمة",
    close: "إغلاق",
    logoTagline: "اكتشف المغرب",
  },
};
