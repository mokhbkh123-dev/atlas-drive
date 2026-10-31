import type { Locale } from "../config";

const fr = {
  eyebrow: "À Propos",
  tagline: "Puissance • Prestige • Performance",
  intro1:
    "ATLAS DRIVE est une plateforme professionnelle de location de voitures premium au Maroc. Notre mission est de fournir un service d'exception alliant élégance, performance et fiabilité.",
  intro2:
    "Nous sélectionnons rigoureusement chaque véhicule de notre flotte pour vous offrir une expérience de conduite incomparable, adaptée à vos exigences les plus élevées.",
  stats: [
    { value: "10+", label: "Années d'expérience" },
    { value: "50+", label: "Véhicules premium" },
    { value: "1000+", label: "Clients satisfaits" },
  ],
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
    stats: [
      { value: "10+", label: "Years of experience" },
      { value: "50+", label: "Premium vehicles" },
      { value: "1000+", label: "Satisfied customers" },
    ],
  },
  ar: {
    eyebrow: "من نحن",
    tagline: "قوة • فخامة • أداء",
    intro1:
      "ATLAS DRIVE منصة احترافية لتأجير السيارات الفاخرة في المغرب. مهمتنا تقديم خدمة استثنائية تمزج بالأناقة والأداء والموثوقية.",
    intro2:
      "نختار كل سيارة في أسطولنا بعناية صارمة لنقدم لك تجربة قيادة لا مثيل لها، تلبي أعلى توقعاتك.",
    stats: [
      { value: "10+", label: "سنوات من الخبرة" },
      { value: "50+", label: "سيارات فاخرة" },
      { value: "1000+", label: "عملاء راضون" },
    ],
  },
};
