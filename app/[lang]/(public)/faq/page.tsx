import { resolveLocale, getDict } from "@/i18n";

export default async function FAQPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  return (
    <div className="bg-[#050505]">
      <section className="relative overflow-hidden border-b border-white/5 py-14 sm:py-20 lg:py-24">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(201,169,97,0.14),transparent_70%)]" />
        <div className="container-luxe relative text-center">
          <p className="eyebrow eyebrow-center justify-center">FAQ</p>
          <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-ivory sm:text-4xl lg:text-5xl">
            {dict.faq.title}
          </h1>
        </div>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <div className="container-luxe max-w-3xl">
          <dl className="space-y-3">
            {dict.faq.questions.map((faq, idx) => (
              <div
                key={idx}
                className="card-luxe overflow-hidden p-6 transition-colors hover:border-gold/35"
              >
                <dt className="text-lg font-semibold text-ivory">{faq.q}</dt>
                <dd className="mt-2 text-sm leading-7 text-white/55">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
