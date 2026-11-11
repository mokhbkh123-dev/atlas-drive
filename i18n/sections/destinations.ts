import type { Locale } from "../config";

const fr = {
  eyebrow: "Destinations",
  title: "Top",
  titleHighlight: "destinations",
  subtitle:
    "Découvrez les villes et les paysages les plus magnifiques du Maroc et louez la voiture idéale pour votre voyage.",
  ctaTitle: "Votre aventure marocaine vous attend",
  ctaText:
    "Des villes vibrantes aux paysages à couper le souffle, créez des souvenirs inoubliables.",
  ctaPrimary: "Planifier mon voyage",
  viewDetails: "Voir les détails",
  roadTip: "Route conseillée",
  distanceLabel: "Distance depuis l'agence",
  imageMissing: "Photo bientôt disponible",
  items: [
    {
      slug: "marrakech",
      name: "Marrakech",
      tagline: "La Ville Rouge",
      desc: "Place Jemaa el-Fna, souks et jardins Majorelle. Parfait avec une citadine confortable ou un SUV pour sortir vers l'Atlas.",
      road: "Rocade · Vallée de l'Ourika",
    },
    {
      slug: "agadir",
      name: "Agadir",
      tagline: "Soleil & Plage",
      desc: "Une baie face à l'océan, une promenade de sable et des hôtels ouverts toute l'année. Idéale en cabriolet ou en break.",
      road: "Corniche · Taghazout",
    },
    {
      slug: "fes",
      name: "Fès",
      tagline: "Histoire & Culture",
      desc: "La médina médiévale la plus vaste du monde, tanneries et médersas. Une voiture compacte facilite les ruelles étroites.",
      road: "Médina · Meknès",
    },
    {
      slug: "tanger",
      name: "Tanger",
      tagline: "La Porte du Nord",
      desc: "Entre Méditerranée et Atlantique, à une heure de l'Europe. Parfaite pour un road-trip costal en boîte automatique.",
      road: "Cap Spartel · Asilah",
    },
    {
      slug: "chefchaouen",
      name: "Chefchaouen",
      tagline: "La Perle Bleue",
      desc: "Des ruelles bleues accrochées au Rif. La montée est raide : un 4x4 ou une boîte automatique y est plus confortable.",
      road: "Rif · Ouazzane",
    },
    {
      slug: "essaouira",
      name: "Essaouira",
      tagline: "Charme Atlantique",
      desc: "Remparts, vent et marché aux poissons. La route côtière vers Agadir est l'une des plus belles du pays.",
      road: "Côte · Agadir",
    },
    {
      slug: "sahara",
      name: "Désert du Sahara",
      tagline: "Aventure & Nature",
      desc: "Dunes de Merzouga et nuit en bivouac. 4x4 et réservoir plein obligatoires entre Tinghir et les dunes.",
      road: "Tinghir · Merzouga",
    },
    {
      slug: "ouarzazate",
      name: "Ouarzazate",
      tagline: "Le Hollywood du Maroc",
      desc: "Kasbahs, studios de cinéma et la vallée du Draâ. Le col de Tizi n'Tichka se prend en véhicule haut.",
      road: "Tizi n'Tichka · Aït Ben Haddou",
    },
  ],
};

/**
 * Destinations page (`app/[lang]/destinations/page.tsx`) and the
 * home-page destinations band.
 * Keys must stay in sync with the "fr" base dictionary.
 */
export const destinations: Record<Locale, typeof fr> = {
  fr,
  en: {
    eyebrow: "Destinations",
    title: "Top",
    titleHighlight: "Destinations",
    subtitle:
      "Discover Morocco's most stunning cities and landscapes, and find the perfect car for your journey.",
    ctaTitle: "Your Moroccan adventure awaits",
    ctaText:
      "From vibrant cities to breathtaking landscapes, create unforgettable memories.",
    ctaPrimary: "Plan your trip",
    viewDetails: "View details",
    roadTip: "Recommended route",
    distanceLabel: "Distance from the agency",
    imageMissing: "Photo coming soon",
    items: [
      {
        slug: "marrakech",
        name: "Marrakech",
        tagline: "The Red City",
        desc: "Jemaa el-Fna square, souks and the Majorelle Garden. Works well with a comfortable city car or an SUV for Atlas day trips.",
        road: "Rocade · Ourika Valley",
      },
      {
        slug: "agadir",
        name: "Agadir",
        tagline: "Sun & Beach",
        desc: "An ocean-facing bay, a sandy promenade and hotels open all year. Best enjoyed in a convertible or an estate car.",
        road: "Corniche · Taghazout",
      },
      {
        slug: "fes",
        name: "Fès",
        tagline: "History & Culture",
        desc: "The largest medieval medina in the world: tanneries and madrasas. A compact car makes the narrow alleys far easier.",
        road: "Medina · Meknès",
      },
      {
        slug: "tanger",
        name: "Tanger",
        tagline: "The Gateway",
        desc: "Between the Mediterranean and the Atlantic, an hour from Europe. Ideal for a coastal road trip in an automatic.",
        road: "Cap Spartel · Asilah",
      },
      {
        slug: "chefchaouen",
        name: "Chefchaouen",
        tagline: "The Blue Pearl",
        desc: "Blue lanes climbing through the Rif mountains. The ascent is steep, so a 4x4 or automatic is the more comfortable choice.",
        road: "Rif · Ouazzane",
      },
      {
        slug: "essaouira",
        name: "Essaouira",
        tagline: "Coastal Charm",
        desc: "Ramparts, wind and a fish market. The coastal road down to Agadir is one of the finest in the country.",
        road: "Coast road · Agadir",
      },
      {
        slug: "sahara",
        name: "Sahara Desert",
        tagline: "Adventure & Nature",
        desc: "The dunes of Merzouga and a night in a bivouac. A 4x4 with a full tank is essential between Tinghir and the dunes.",
        road: "Tinghir · Merzouga",
      },
      {
        slug: "ouarzazate",
        name: "Ouarzazate",
        tagline: "The Hollywood of Morocco",
        desc: "Kasbahs, film studios and the Draa valley. Take the Tizi n'Tichka pass in a taller vehicle.",
        road: "Tizi n'Tichka · Aït Ben Haddou",
      },
    ],
  },
  ar: {
    eyebrow: "الوجهات",
    title: "أفضل",
    titleHighlight: "الوجهات",
    subtitle:
      "اكتشفوا أجمل مدن المغرب ومناظره الطبيعية واعثروا على السيارة المثالية لرحلتكم.",
    ctaTitle: "مغامرتكم في المغرب تنتظركم",
    ctaText:
      "من المدن النابضة بالحياة إلى المناظر الخلابة، اصنعوا ذكريات لا تُنسى.",
    ctaPrimary: "خططوا لرحلتكم",
    viewDetails: "عرض التفاصيل",
    roadTip: "الطريق الموصى به",
    distanceLabel: "المسافة من الوكالة",
    imageMissing: "الصورة متوفرة قريبًا",
    items: [
      {
        slug: "marrakech",
        name: "مراكش",
        tagline: "المدينة الحمراء",
        desc: "ساحة جامع الفنا والأسواق وحدائق ماجوريل. تناسبها سيارة مريحة للمدينة أو SUV للخروج نحو الأطلس.",
        road: "الطريق الدائري · وادي أوريكا",
      },
      {
        slug: "agadir",
        name: "أكادير",
        tagline: "شمس و شاطئ",
        desc: "خليج مطل على المحيط و كورنيش رملي و فنادق مفتوحة طوال السنة. مثالية مع سيارة مكشوفة أو عائلية.",
        road: "الكورنيش · تغازوت",
      },
      {
        slug: "fes",
        name: "فاس",
        tagline: "تاريخ و ثقافة",
        desc: "أكبر مدينة قديمة في العالم: دباغين و مدارس. سيارة صغيرة تجعل الأزقة الضيقة أسهل بكثير.",
        road: "المدينة القديمة · مكناس",
      },
      {
        slug: "tanger",
        name: "طنجة",
        tagline: "بوابة الشمال",
        desc: "بين البحر الأبيض المتوسط والأطلسي، على بعد ساعة من أوروبا. رائعة لرحلة ساحلية بناقل أوتوماتيكي.",
        road: "رأس سبارتيل · أصيلة",
      },
      {
        slug: "chefchaouen",
        name: "شفشاون",
        tagline: "اللؤلؤة الزرقاء",
        desc: "أزقة زرقاء صاعدة في جبال الريف. المرتقى شديد الانحدار، لذا SUV أو ناقل أوتوماتيكي أكثر راحة.",
        road: "الريف · وزان",
      },
      {
        slug: "essaouira",
        name: "الصويرة",
        tagline: "سحر الأطلسي",
        desc: "أسوار و ريح و سوق للسمك. الطريق الساحلي نحو أكادير من أجمل طرق البلاد.",
        road: "الطريق الساحلي · أكادير",
      },
      {
        slug: "sahara",
        name: "الصحراء الكبرى",
        tagline: "مغامرة و طبيعة",
        desc: "كثبان مرزوقة و ليلة في مخيم. الدفع الرباعي و خزان ممتلئ ضروريان بين تنغير و الكثبان.",
        road: "تنغير · مرزوقة",
      },
      {
        slug: "ouarzazate",
        name: "ورزازات",
        desc: "قصور و استوديوهات سينما و وادي درعة. ممر تيزي نتيشكا يُقطع بسيارة مرتفعة.",
        tagline: "هوليوود المغرب",
        road: "تيزي نتيشكا · آيت بن حدو",
      },
    ],
  },
};
