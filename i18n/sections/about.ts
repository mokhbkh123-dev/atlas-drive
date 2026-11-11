import type { Locale } from "../config";

const fr = {
  eyebrow: "À Propos",
  tagline: "Puissance • Prestige • Performance",
  intro1:
    "ATLAS DRIVE est une plateforme professionnelle de location de voitures premium au Maroc. Notre mission est de fournir un service d'exception alliant élégance, performance et fiabilité.",
  intro2:
    "Nous sélectionnons rigoureusement chaque véhicule de notre flotte pour vous offrir une expérience de conduite incomparable, adaptée à vos exigences les plus élevées.",
  statsFleet: "Véhicules disponibles",
  statsCategories: "Catégories de véhicules",
  statsDestinations: "Destinations couvertes",
};

/**
 * About page (`app/[lang]/about/page.tsx`).
 * Keys must stay in sync with the "fr" base dictionary.
 */
export const about: Record<Locale, typeof fr> = {
  fr,
  en: {
    eyebrow: "About Us",
    tagline: "Power • Prestige • Performance",
    intro1:
      "ATLAS DRIVE is a professional premium car rental platform in Morocco. Our mission is to provide an exceptional service combining elegance, performance and reliability.",
    intro2:
      "We rigorously select every vehicle in our fleet to offer you an incomparable driving experience, tailored to your highest expectations.",
    statsFleet: "Vehicles available",
    statsCategories: "Vehicle categories",
    statsDestinations: "Destinations covered",
  },
  ar: {
    eyebrow: "من نحن",
    tagline: "قوة • فخامة • أداء",
    intro1:
      "ATLAS DRIVE منصة احترافية لتأجير السيارات الفاخرة في المغرب. مهمتنا تقديم خدمة استثنائية تمزج بالأناقة والأداء والموثوقية.",
    intro2:
      "نختار كل سيارة في أسطولنا بعناية صارمة لنقدم لك تجربة قيادة لا مثيل لها، تلبي أعلى توقعاتك.",
    statsFleet: "سيارات متوفرة",
    statsCategories: "فئات السيارات",
    statsDestinations: "وجهات مغطاة",
  },
};
