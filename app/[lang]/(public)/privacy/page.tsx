import { resolveLocale, getDict } from "@/i18n";

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  return (
    <div className="bg-[#050505]">
      <section className="border-b border-white/5 py-12 sm:py-16">
        <div className="container-luxe max-w-3xl">
          <p className="eyebrow">{dict.footer.privacy}</p>
          <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-ivory sm:text-4xl">
            {dict.privacy.title}
          </h1>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container-luxe max-w-3xl">
          <div className="space-y-5">
            {dict.privacy.paragraphs.map((paragraph, idx) => (
              <p key={idx} className="text-sm leading-7 text-white/55 sm:text-base">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
