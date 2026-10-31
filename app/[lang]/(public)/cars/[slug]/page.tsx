import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  DoorOpen,
  Fuel,
  Settings2,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getDict, resolveLocale, tEnum } from "@/i18n";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const lang = await resolveLocale(params);
  const { slug } = await params;
  const dict = getDict(lang);

  const car = await prisma.car.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!car || car.status !== "PUBLISHED") {
    notFound();
  }

  const primaryImage = car.images.find((img) => img.isPrimary) || car.images[0];
  const label = car.name || `${car.brand} ${car.model}`;

  const specs = [
    {
      label: dict.cars.specs.transmission,
      value: tEnum(dict, "transmission", car.transmission),
      icon: Settings2,
    },
    {
      label: dict.cars.specs.fuel,
      value: tEnum(dict, "fuel", car.fuelType),
      icon: Fuel,
    },
    {
      label: dict.cars.specs.seats,
      value: String(car.seats),
      icon: Users,
    },
    {
      label: dict.cars.specs.doors,
      value: String(car.doors),
      icon: DoorOpen,
    },
  ];

  return (
    <div className="bg-[#050505]">
      <div className="container-luxe py-8 sm:py-12 lg:py-16">
        <Link
          href={`/${lang}/cars`}
          className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
          {dict.cars.backToFleet}
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-12">
          <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#101010] sm:aspect-[16/10]">
              {primaryImage ? (
                <img
                  src={primaryImage.url}
                  alt={primaryImage.alt || label}
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920&auto=format&fit=crop"
                  alt={label}
                  className="h-full w-full object-cover"
                />
              )}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent"
              />
              <span className="absolute start-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold backdrop-blur">
                {tEnum(dict, "category", car.category)}
              </span>
            </div>

            {car.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
                {car.images.slice(1).map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-[#101010]"
                  >
                    <img
                      src={img.url}
                      alt={img.alt || label}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {car.description && (
              <div className="mt-8 hidden border-t border-white/10 pt-8 lg:block">
                <h2 className="text-lg font-semibold text-ivory">
                  {dict.cars.descriptionHeading}
                </h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/55">
                  {car.description}
                </p>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-ivory sm:text-4xl lg:text-5xl">
              {label}
            </h1>
            <p className="mt-3 text-sm text-white/50 sm:text-base">
              {car.brand} {car.model}
              {car.year ? ` · ${car.year}` : ""}
            </p>

            <div className="card-luxe mt-7 overflow-hidden">
              <div className="border-b border-white/10 p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  {dict.cars.perDayLong}
                </p>
                <p className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl font-bold text-gold sm:text-4xl">
                    {formatCurrency(Number(car.dailyPrice), lang)}
                  </span>
                  <span className="text-sm text-white/40">{dict.cars.perDay}</span>
                </p>

                <Link
                  href={`/${lang}/booking?carId=${car.id}`}
                  className="btn-gold mt-6 w-full"
                >
                  {dict.booking?.ctaBookNow || dict.cars.bookCta}
                  <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
                </Link>
              </div>

              <div className="space-y-3 p-5 text-sm text-white/55 sm:p-6">
                <p>{dict.booking.minDurationHint}</p>
                <p className="text-xs leading-6 text-white/40">
                  {dict.booking.whatsappNote}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-ivory">
                {dict.cars.specs.heading}
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-xl border border-white/10 bg-white/[0.025] p-4"
                  >
                    <spec.icon className="h-4 w-4 text-gold" aria-hidden />
                    <dt className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                      {spec.label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-ivory">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {car.description && (
              <div className="mt-8 border-t border-white/10 pt-8 lg:hidden">
                <h2 className="text-lg font-semibold text-ivory">
                  {dict.cars.descriptionHeading}
                </h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/55">
                  {car.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
