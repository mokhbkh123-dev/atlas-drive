import { resolveLocale, getDict } from "@/i18n";

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  return (
    <div className="bg-cream">
      <section className="border-b border-line bg-cream-2 py-12 sm:py-16">
        <div className="container-site max-w-3xl">
          <p className="eyebrow">{dict.footer.privacy}</p>
          <h1 className="heading-display mt-4 text-balance text-3xl sm:text-4xl">
            {dict.privacy.title}
          </h1>
          <div className="rule-gold mt-6 max-w-xs" aria-hidden />
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container-site max-w-3xl">
          <div className="space-y-6">
            {dict.privacy.paragraphs.map((paragraph, idx) => (
              <p key={idx} className="text-[15px] leading-8 text-muted sm:text-base">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
