import { getDict, resolveLocale } from "@/i18n";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  return (
    <div className="bg-cream">
      <section className="relative overflow-hidden border-b border-line bg-cream-2 py-14 sm:py-18">
        <div aria-hidden className="paper-grid absolute inset-0 opacity-70" />
        <div className="container-site relative text-center">
          <p className="eyebrow eyebrow-center justify-center">{dict.services.eyebrow}</p>
          <h1 className="heading-display mt-5 text-balance text-3xl sm:text-4xl lg:text-5xl">
            {dict.services.title}{" "}
            <span className={`text-bronze-dark ${lang === "ar" ? "" : "italic"}`}>
              {dict.services.titleHighlight}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted sm:text-base">
            {dict.services.subtitle}
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <div className="container-site">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dict.services.items.map((service, idx) => (
              <div key={idx} className="card-site card-hover group p-6 sm:p-7">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-bronze/35 bg-bronze-soft text-xs font-bold text-bronze-dark">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-5 text-lg font-semibold text-ink">{service.title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted">{service.desc}</p>
                <span
                  aria-hidden
                  className="mt-6 block h-0.5 w-8 rounded-full bg-bronze/60 transition-all duration-300 group-hover:w-14"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
