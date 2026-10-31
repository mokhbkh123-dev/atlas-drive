import { getDict, resolveLocale } from "@/i18n";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  return (
    <div className="bg-[#050505]">
      <section className="relative overflow-hidden border-b border-white/5 py-14 sm:py-20 lg:py-24">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(201,169,97,0.16),transparent_70%)]" />
        <div className="container-luxe relative">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow eyebrow-center justify-center">{dict.about.eyebrow}</p>
            <h1 className="mt-5 text-balance text-[clamp(2.6rem,8vw,5rem)] font-black uppercase leading-[0.95] tracking-tight">
              ATLAS{" "}
              <span
                className={`text-gold ${
                  lang === "ar" ? "" : "font-serif font-medium italic tracking-normal"
                }`}
              >
                DRIVE
              </span>
            </h1>
            <p className="mt-5 text-xs uppercase tracking-[0.2em] text-white/45 sm:text-sm">
              {dict.about.tagline}
            </p>
            <p className="mt-7 text-base leading-8 text-white/60 sm:text-lg">
              {dict.about.intro1}
            </p>
            <p className="mt-5 text-base leading-8 text-white/55 sm:text-lg">
              {dict.about.intro2}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-luxe">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {dict.about.stats.map((stat) => (
              <div
                key={stat.label}
                className="card-luxe p-6 text-center sm:p-8"
              >
                <p className="text-3xl font-bold text-gold sm:text-4xl lg:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
