import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getDict, resolveLocale } from "@/i18n";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  // Only cars that are actually on offer: stock photography of supercars the
  // agency does not rent would advertise a fleet that does not exist.
  const shots = await prisma.carImage.findMany({
    where: { car: { status: "PUBLISHED" } },
    include: { car: { select: { id: true, name: true, brand: true, model: true } } },
    orderBy: [
      { car: { createdAt: "desc" } },
      { isPrimary: "desc" },
      { sortOrder: "asc" },
    ],
  });

  return (
    <div className="bg-cream">
      <section className="relative overflow-hidden border-b border-line bg-cream-2 py-14 sm:py-18">
        <div aria-hidden className="paper-grid absolute inset-0 opacity-70" />
        <div className="container-site relative text-center">
          <p className="eyebrow eyebrow-center justify-center">{dict.gallery.eyebrow}</p>
          <h1 className="heading-display mt-5 text-balance text-3xl sm:text-4xl lg:text-5xl">
            {dict.gallery.title}{" "}
            <span className={`text-bronze-dark ${lang === "ar" ? "" : "italic"}`}>
              {dict.gallery.titleHighlight}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted sm:text-base">
            {dict.gallery.subtitle}
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <div className="container-site">
          {shots.length === 0 ? (
            <div className="card-site p-12 text-center">
              <p className="text-sm text-muted">{dict.gallery.empty}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shots.map((shot, index) => {
                const label = shot.car.name || `${shot.car.brand} ${shot.car.model}`;
                return (
                  <figure key={shot.id} className="card-site card-hover overflow-hidden">
                    <img
                      src={shot.url}
                      alt={shot.alt || label}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                      loading={index < 3 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <figcaption className="border-t border-line px-4 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                      {label}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          )}

          <div className="mt-10 flex justify-center sm:mt-12">
            <Link href={`/${lang}/cars`} className="btn-primary">
              {dict.gallery.cta}
              <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
