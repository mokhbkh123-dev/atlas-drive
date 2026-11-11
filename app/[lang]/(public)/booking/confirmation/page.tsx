import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { notFound } from "next/navigation";
import { getDict, resolveLocale, tEnum } from "@/i18n";

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  const { ref } = await searchParams;

  if (!ref) {
    notFound();
  }

  const booking = await prisma.booking.findUnique({
    where: { publicRef: ref },
    include: { car: true },
  });

  if (!booking) {
    notFound();
  }

  const confirmation = dict.booking.confirmation;

  return (
    <div className="bg-cream">
      <section className="container-site max-w-2xl py-14 sm:py-18 lg:py-20">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-bronze/40 bg-bronze-soft">
            <svg
              className="h-6 w-6 text-bronze-dark"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="heading-display mt-5 text-balance text-3xl sm:text-4xl">
            {confirmation.successTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base leading-7 text-muted">
            {confirmation.successText}
          </p>
        </div>

        <div className="card-site mt-9 overflow-hidden">
          <div className="border-b border-line bg-cream-2/60 px-5 py-4 sm:px-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-bronze">
              {confirmation.detailsHeading}
            </h2>
          </div>
          <dl className="divide-y divide-line px-5 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <dt className="text-muted">{confirmation.reference}</dt>
              <dd className="chip font-mono tracking-wide text-ink">{booking.publicRef}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <dt className="text-muted">{confirmation.status}</dt>
              <dd className="font-medium text-ink">
                {tEnum(dict, "bookingStatus", booking.status)}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <dt className="text-muted">{confirmation.vehicle}</dt>
              <dd className="font-medium text-ink">
                {booking.car.name || `${booking.car.brand} ${booking.car.model}`}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <dt className="text-muted">{confirmation.pickupAt}</dt>
              <dd className="font-medium text-ink">{formatDateTime(booking.pickupAt, lang)}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <dt className="text-muted">{confirmation.returnAt}</dt>
              <dd className="font-medium text-ink">{formatDateTime(booking.returnAt, lang)}</dd>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
              <dt className="text-muted">{confirmation.locations}</dt>
              <dd className="text-end font-medium text-ink">
                {booking.pickupLocation} → {booking.returnLocation}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
              <dt className="text-muted">{confirmation.total}</dt>
              <dd className="text-lg font-bold text-bronze-dark">
                {formatCurrency(Number(booking.totalPrice), lang)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 text-center">
          <Link href={`/${lang}`} className="btn-dark">
            {confirmation.backHome}
          </Link>
        </div>
      </section>
    </div>
  );
}
