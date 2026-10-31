import { getDict, resolveLocale } from "@/i18n";
import { Clock, Mail, MapPin } from "lucide-react";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  const items = [
    {
      label: dict.contact.addressLabel,
      value: dict.contact.addressValue,
      icon: MapPin,
    },
    {
      label: dict.contact.emailLabel,
      value: dict.contact.emailValue,
      icon: Mail,
      href: `mailto:${dict.contact.emailValue}`,
    },
    {
      label: dict.contact.hoursLabel,
      value: dict.contact.hoursValue,
      icon: Clock,
    },
  ];

  return (
    <div className="bg-[#050505]">
      <section className="relative overflow-hidden border-b border-white/5 py-14 sm:py-20 lg:py-24">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(201,169,97,0.14),transparent_70%)]" />
        <div className="container-luxe relative text-center">
          <p className="eyebrow eyebrow-center justify-center">{dict.contact.eyebrow}</p>
          <h1 className="mt-5 text-balance text-[clamp(2.6rem,8vw,5rem)] font-black uppercase leading-[0.95] tracking-tight">
            {dict.contact.title}{" "}
            <span
              className={`text-gold ${
                lang === "ar" ? "" : "font-serif font-medium italic tracking-normal"
              }`}
            >
              {dict.contact.titleHighlight}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-xs uppercase tracking-[0.2em] text-white/45 sm:text-sm">
            {dict.contact.subtitle}
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <div className="container-luxe max-w-4xl">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            {items.map((item) => (
              <div key={item.label} className="card-luxe p-6 text-center sm:p-7">
                <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                  {item.label}
                </h2>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-2 block break-all text-lg text-ivory transition-colors hover:text-gold"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-2 text-lg text-ivory">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
