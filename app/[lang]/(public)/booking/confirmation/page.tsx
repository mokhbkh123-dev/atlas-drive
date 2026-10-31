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
    <div className="bg-[#050505]">
      <div className="container-luxe max-w-2xl py-14 sm:py-18 lg:py-24">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/35 bg-gold/10">
            <svg
              className="h-6 w-6 text-gold"
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
          <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-ivory sm:text-4xl">
            {confirmation.successTitle}
          </h1>
          <p className="mt-3 text-base leading-7 text-white/55">
            {confirmation.successText}
          </p>
        </div>

        <div className="card-luxe mt-9 overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              {confirmation.detailsHeading}
            </h2>
          </div>
          <dl className="divide-y divide-white/10 px-5 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <dt className="text-white/45">{confirmation.reference}</dt>
              <dd className="font-medium text-ivory">{booking.publicRef}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <dt className="text-white/45">{confirmation.status}</dt>
              <dd className="font-medium text-ivory">
                {tEnum(dict, "bookingStatus", booking.status)}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <dt className="text-white/45">{confirmation.vehicle}</dt>
              <dd className="font-medium text-ivory">
                {booking.car.name || `${booking.car.brand} ${booking.car.model}`}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <dt className="text-white/45">{confirmation.pickupAt}</dt>
              <dd className="font-medium text-ivory">
                {formatDateTime(booking.pickupAt, lang)}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <dt className="text-white/45">{confirmation.returnAt}</dt>
              <dd className="font-medium text-ivory">
                {formatDateTime(booking.returnAt, lang)}
              </dd>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
              <dt className="text-white/45">{confirmation.locations}</dt>
              <dd className="text-end font-medium text-ivory">
                {booking.pickupLocation} → {booking.returnLocation}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
              <dt className="text-white/45">{confirmation.total}</dt>
              <dd className="text-lg font-bold text-gold">
                {formatCurrency(Number(booking.totalPrice), lang)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 text-center">
          <Link href={`/${lang}`} className="btn-ghost">
            {confirmation.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
