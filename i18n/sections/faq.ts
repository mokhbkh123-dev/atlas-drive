import type { Locale } from "../config";

const fr = {
  title: "Questions fréquentes",
  questions: [
    {
      q: "Comment réserver un véhicule ?",
      a: "Vous pouvez réserver directement en ligne via notre formulaire de réservation ou nous contacter.",
    },
    {
      q: "Quels documents sont nécessaires ?",
      a: "Permis de conduire valide, pièce d'identité ou passeport sont généralement requis.",
    },
    {
      q: "Les tarifs incluent-ils l'assurance ?",
      a: "Les détails d'assurance sont précisés lors de la confirmation de votre réservation.",
    },
  ],
};

/**
 * FAQ page strings. French is copied verbatim from the page (source of truth).
 * Keys must stay in sync with the `fr` base dictionary.
 */
export const faq: Record<Locale, typeof fr> = {
  fr,
  en: {
    title: "Frequently Asked Questions",
    questions: [
      {
        q: "How do I book a vehicle?",
        a: "You can book directly online through our booking form or contact us.",
      },
      {
        q: "What documents are required?",
        a: "A valid driver's license and an ID card or passport are generally required.",
      },
      {
        q: "Do the rates include insurance?",
        a: "Insurance details are provided when your booking is confirmed.",
      },
    ],
  },
  ar: {
    title: "الأسئلة الشائعة",
    questions: [
      {
        q: "كيف أحجز سيارة؟",
        a: "يمكنك الحجز مباشرة عبر الإنترنت من خلال نموذج الحجز الخاص بنا أو التواصل معنا.",
      },
      {
        q: "ما الوثائق المطلوبة؟",
        a: "يُطلب عادةً رخصة قيادة سارية المفعول وبطاقة هوية أو جواز سفر.",
      },
      {
        q: "هل تشمل الأسعار التأمين؟",
        a: "تُحدد تفاصيل التأمين عند تأكيد حجزك.",
      },
    ],
  },
};
