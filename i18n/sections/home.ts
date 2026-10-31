import type { Locale } from "../config";

const fr = {
  heroBadge: "ATLAS DRIVE • Maroc",
  heroTitleLine1: "Location de voitures",
  heroTitleLine2: "haute performance",
  heroText:
    "Découvrez notre flotte exclusive de véhicules premium. Elegance, puissance et service sur-mesure pour chaque trajet au Maroc.",
  heroCtaPrimary: "Explorer la flotte",
  heroCtaSecondary: "Demander un devis",

  // --- Catégories de véhicules (components/CarCategories.tsx) ---
  categoriesEyebrow: "Nos catégories",
  categoriesTitle: "Trouvez votre style de conduite",
  categoriesSubtitle:
    "Des berlines aux supercars, explorez chaque univers de notre flotte et trouvez le véhicule qui vous correspond.",
  categoriesCta: "Voir les voitures",
  categoriesCountOne: "1 véhicule disponible",
  categoriesCountMany: "{count} véhicules disponibles",
  categories: {
    sport: { name: "Sport", desc: "Performance et sensations fortes à chaque accélération." },
    sedan: { name: "Berlines", desc: "Confort, élégance et raffinement au quotidien." },
    suv: { name: "SUV & 4x4", desc: "Espace et robustesse pour tous les terrains." },
    supercar: { name: "Supercars", desc: "L'exception automobile à l'état pur." },
    automatic: { name: "Boîtes automatiques", desc: "Une conduite fluide, sans effort et sans compromis." },
    budget: { name: "Véhicules économiques", desc: "Le meilleur rapport qualité-prix de notre flotte." },
  },

  fleetEyebrow: "Notre Flotte",
  fleetTitle: "Véhicules à louer",
  fleetSeeAll: "Voir tous",
  pricePerDay: "{price}/jour",

  advantagesEyebrow: "Avantages",
  advantagesTitle: "Pourquoi choisir Atlas Drive",
  advantagesText: "Une expérience de location premium à chaque étape",
  advantages: [
    { title: "Véhicules vérifiés", desc: "Entretien rigoureux et contrôle qualité" },
    { title: "Tarifs transparents", desc: "Sans frais cachés, prix clairs" },
    { title: "Service à domicile", desc: "Livraison et récupération" },
    { title: "Réponse rapide", desc: "Confirmation sous 24h" },
  ],

  ctaTitle: "Prêt à prendre le volant ?",
  ctaText: "Réservez votre véhicule premium dès aujourd'hui",
  ctaPrimary: "Voir la flotte",
  ctaSecondary: "Nous contacter",
};

/**
 * Home page (`app/[lang]/page.tsx`).
 * Keys must stay in sync with the "fr" base dictionary.
 */
export const home: Record<Locale, typeof fr> = {
  fr,
  en: {
    heroBadge: "ATLAS DRIVE • Morocco",
    heroTitleLine1: "Car rental",
    heroTitleLine2: "high performance",
    heroText:
      "Discover our exclusive fleet of premium vehicles. Elegance, power and a bespoke service for every journey in Morocco.",
    heroCtaPrimary: "Explore the fleet",
    heroCtaSecondary: "Request a quote",

    categoriesEyebrow: "Our categories",
    categoriesTitle: "Find your driving style",
    categoriesSubtitle:
      "From sedans to supercars, explore every side of our fleet and find the vehicle that suits you.",
    categoriesCta: "Explore cars",
    categoriesCountOne: "1 car available",
    categoriesCountMany: "{count} cars available",
    categories: {
      sport: { name: "Sport", desc: "Performance and pure thrills with every acceleration." },
      sedan: { name: "Sedans", desc: "Comfort, elegance and refinement, every day." },
      suv: { name: "SUV & 4x4", desc: "Space and capability for every terrain." },
      supercar: { name: "Supercars", desc: "The automotive exception in its purest form." },
      automatic: { name: "Automatic", desc: "Smooth, effortless and uncompromising driving." },
      budget: { name: "Budget-friendly", desc: "The best value for money in our fleet." },
    },

    fleetEyebrow: "Our Fleet",
    fleetTitle: "Cars for rent",
    fleetSeeAll: "See all",
    pricePerDay: "{price}/day",

    advantagesEyebrow: "Advantages",
    advantagesTitle: "Why choose Atlas Drive",
    advantagesText: "A premium rental experience at every step",
    advantages: [
      { title: "Verified vehicles", desc: "Rigorous maintenance and quality control" },
      { title: "Transparent pricing", desc: "No hidden fees, clear prices" },
      { title: "Door-to-door service", desc: "Delivery and pick-up" },
      { title: "Quick response", desc: "Confirmation within 24h" },
    ],

    ctaTitle: "Ready to take the wheel?",
    ctaText: "Book your premium vehicle starting today",
    ctaPrimary: "View the fleet",
    ctaSecondary: "Contact us",
  },
  ar: {
    heroBadge: "ATLAS DRIVE • المغرب",
    heroTitleLine1: "تأجير السيارات",
    heroTitleLine2: "عالية الأداء",
    heroText:
      "اكتشفوا أسطولنا الحصري من السيارات الفاخرة. الأناقة والقوة وخدمة مخصصة لكل رحلة في المغرب.",
    heroCtaPrimary: "استكشف الأسطول",
    heroCtaSecondary: "اطلب عرض سعر",

    categoriesEyebrow: "فئاتنا",
    categoriesTitle: "اعثر على أسلوب قيادتك",
    categoriesSubtitle:
      "من سيارات السيدان إلى السيارات الخارقة، استكشف كل جوانب أسطولنا واعثر على السيارة التي تناسبك.",
    categoriesCta: "استكشف السيارات",
    categoriesCountOne: "سيارة واحدة متاحة",
    categoriesCountMany: "{count} سيارات متاحة",
    categories: {
      sport: { name: "رياضية", desc: "أداء وإحساس حقيقي بالقيادة مع كل تسارع." },
      sedan: { name: "سيدان", desc: "راحة وأناقة ورفاهية كل يوم." },
      suv: { name: "SUV و 4x4", desc: "مساحة وقوة لكل التضاريس." },
      supercar: { name: "سيارات خارقة", desc: "الاستثناء في عالم السيارات بأبهى صوره." },
      automatic: { name: "ناقل أوتوماتيكي", desc: "قيادة سلسة دون عناء أو تنازلات." },
      budget: { name: "سيارات اقتصادية", desc: "أفضل قيمة مقابل السعر في أسطولنا." },
    },

    fleetEyebrow: "أسطولنا",
    fleetTitle: "سيارات للإيجار",
    fleetSeeAll: "عرض الكل",
    pricePerDay: "{price}/اليوم",

    advantagesEyebrow: "المزايا",
    advantagesTitle: "لماذا تختار ATLAS DRIVE",
    advantagesText: "تجربة إيجار فاخرة في كل مرحلة",
    advantages: [
      { title: "سيارات موثقة", desc: "صيانة دقيقة وفحص جودة" },
      { title: "أسعار شفافة", desc: "بدون رسوم خفية، أسعار واضحة" },
      { title: "خدمة التوصيل المنزلي", desc: "التوصيل والاستلام" },
      { title: "استجابة سريعة", desc: "تأكيد خلال 24 ساعة" },
    ],

    ctaTitle: "هل أنت مستعد لقيادة السيارة؟",
    ctaText: "احجز سيارتك الفاخرة بدءًا من اليوم",
    ctaPrimary: "عرض الأسطول",
    ctaSecondary: "تواصل معنا",
  },
};
