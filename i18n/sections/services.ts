import type { Locale } from "../config";

const fr = {
  eyebrow: "Services",
  title: "NOS",
  titleHighlight: "SERVICES",
  subtitle: "Excellence au service de votre mobilité",
  items: [
    { title: "Location à la journée", desc: "Flexibilité maximale pour vos déplacements ponctuels." },
    { title: "Location longue durée", desc: "Tarifs avantageux pour vos projets sur plusieurs jours." },
    { title: "Livraison & Récupération", desc: "Service premium à votre domicile ou à votre lieu de travail." },
    { title: "Accompagnement VIP", desc: "Service personnalisé selon vos exigences." },
    { title: "Véhicules haut de gamme", desc: "Flotte rigoureusement sélectionnée et entretenue." },
    { title: "Assistance 24/7", desc: "Tranquillité d'esprit à chaque instant." },
  ],
};

/**
 * Services page (`app/[lang]/services/page.tsx`).
 * Keys must stay in sync with the "fr" base dictionary.
 */
export const services: Record<Locale, typeof fr> = {
  fr,
  en: {
    eyebrow: "Services",
    title: "OUR",
    titleHighlight: "SERVICES",
    subtitle: "Excellence at the service of your mobility",
    items: [
      { title: "Daily rental", desc: "Maximum flexibility for your one-off trips." },
      { title: "Long-term rental", desc: "Great rates for your projects spanning several days." },
      { title: "Delivery & Pick-up", desc: "Premium service at your home or workplace." },
      { title: "VIP assistance", desc: "Personalized service tailored to your needs." },
      { title: "High-end vehicles", desc: "A rigorously selected and maintained fleet." },
      { title: "24/7 assistance", desc: "Peace of mind at every moment." },
    ],
  },
  ar: {
    eyebrow: "الخدمات",
    title: "كل",
    titleHighlight: "خدماتنا",
    subtitle: "التميز في خدمة تنقلاتك",
    items: [
      { title: "الإيجار اليومي", desc: "مرونة قصوى لتنقلاتك العارضة." },
      { title: "الإيجار طويل المدة", desc: "أسعار تنافسية لمشاريعك الممتدة لعدة أيام." },
      { title: "التوصيل والاستلام", desc: "خدمة فاخرة في منزلك أو مكان عملك." },
      { title: "مرافقة VIP", desc: "خدمة شخصية تلبي احتياجاتك." },
      { title: "سيارات عالية المستوى", desc: "أسطول مختار بعناية ومحفوظ باستمرار." },
      { title: "مساعدة على مدار الساعة", desc: "راحة بال في كل وقت." },
    ],
  },
};
