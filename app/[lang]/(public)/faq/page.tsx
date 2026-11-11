import { ChevronDown } from "lucide-react";

import { resolveLocale, getDict } from "@/i18n";

export default async function FAQPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  return (
    <div className="bg-cream">
      <section className="relative overflow-hidden border-b border-line bg-cream-2 py-14 sm:py-18">
        <div aria-hidden className="paper-grid absolute inset-0 opacity-70" />
        <div className="container-site relative text-center">
          <p className="eyebrow eyebrow-center justify-center">{dict.footer.faq}</p>
          <h1 className="heading-display mt-5 text-balance text-3xl sm:text-4xl lg:text-5xl">
            {dict.faq.title}
          </h1>
        </div>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <div className="container-site max-w-3xl">
          <div className="space-y-3">
            {dict.faq.questions.map((faq, idx) => (
              <details
                key={idx}
                className="card-site group px-6 py-5 open:border-bronze/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <span className="text-base font-semibold text-ink">{faq.q}</span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-bronze transition-transform duration-300 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="mt-3 pe-7 text-sm leading-7 text-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
