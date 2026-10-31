import { getDict, resolveLocale } from "@/i18n";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  return (
    <div className="bg-[#050505]">
      <section className="relative overflow-hidden border-b border-white/5 py-14 sm:py-20 lg:py-24">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(201,169,97,0.14),transparent_70%)]" />
        <div className="container-luxe relative text-center">
          <p className="eyebrow eyebrow-center justify-center">{dict.services.eyebrow}</p>
          <h1 className="mt-5 text-balance text-[clamp(2.6rem,8vw,5rem)] font-black uppercase leading-[0.95] tracking-tight">
            {dict.services.title}{" "}
            <span
              className={`text-gold ${
                lang === "ar" ? "" : "font-serif font-medium italic tracking-normal"
              }`}
            >
              {dict.services.titleHighlight}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-xs uppercase tracking-[0.2em] text-white/45 sm:text-sm">
            {dict.services.subtitle}
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <div className="container-luxe">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            {dict.services.items.map((service, idx) => (
              <div
                key={idx}
                className="group card-luxe p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 sm:p-7"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                  <span className="text-xs font-bold">{String(idx + 1).padStart(2, "0")}</span>
                </span>
                <h2 className="mt-5 text-lg font-semibold text-ivory">{service.title}</h2>
                <p className="mt-2 text-sm leading-7 text-white/55">{service.desc}</p>
                <span
                  aria-hidden
                  className="mt-6 block h-px w-8 bg-gold/50 transition-all duration-300 group-hover:w-14"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
