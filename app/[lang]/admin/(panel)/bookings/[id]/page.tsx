import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { requireModule } from "@/lib/rbac";
import { notFound } from "next/navigation";
import BookingActions from "./BookingActions";
import PaymentForm from "./PaymentForm";

import { resolveLocale, getDict, tEnum } from "@/i18n";

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);
  await requireModule(lang, "reservations");
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { car: true, payments: { orderBy: { paidAt: "desc" } } },
  });

  if (!booking) {
    notFound();
  }

  const collected = booking.payments
    .filter((payment) => payment.status === "PAID")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  const remaining = Number(booking.totalPrice) - collected;
  const closed = booking.status === "REJECTED" || booking.status === "CANCELLED";
  const t = dict.admin.bookingPayments;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-admin-ink">{dict.admin.bookingDetail.title}</h1>
        <p className="mt-1 text-sm text-admin-muted">{dict.admin.bookingDetail.reference}: {booking.publicRef}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-admin-line bg-admin-surface">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-base font-medium text-admin-ink">{dict.admin.bookingDetail.customerInfo}</h3>
        </div>
        <div className="border-t border-admin-line px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-admin-line">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-admin-muted">{dict.admin.bookingDetail.fullName}</dt>
              <dd className="mt-1 text-sm text-admin-ink sm:mt-0 sm:col-span-2">{booking.customerName}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-admin-muted">{dict.admin.bookingDetail.phone}</dt>
              <dd className="mt-1 text-sm text-admin-ink sm:mt-0 sm:col-span-2">{booking.customerPhone}</dd>
            </div>
            {booking.customerEmail && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-admin-muted">{dict.admin.bookingDetail.email}</dt>
                <dd className="mt-1 text-sm text-admin-ink sm:mt-0 sm:col-span-2">{booking.customerEmail}</dd>
              </div>
            )}
            {booking.customerNotes && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-admin-muted">{dict.admin.bookingDetail.notes}</dt>
                <dd className="mt-1 text-sm text-admin-ink sm:mt-0 sm:col-span-2">{booking.customerNotes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-admin-line bg-admin-surface">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-base font-medium text-admin-ink">{dict.admin.bookingDetail.bookingInfo}</h3>
        </div>
        <div className="border-t border-admin-line px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-admin-line">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-admin-muted">{dict.admin.bookingDetail.vehicle}</dt>
              <dd className="mt-1 text-sm text-admin-ink sm:mt-0 sm:col-span-2">
                {booking.car.name || `${booking.car.brand} ${booking.car.model}`}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-admin-muted">{dict.admin.bookingDetail.pickup}</dt>
              <dd className="mt-1 text-sm text-admin-ink sm:mt-0 sm:col-span-2">
                {formatDateTime(booking.pickupAt, lang)} - {booking.pickupLocation}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-admin-muted">{dict.admin.bookingDetail.returnLabel}</dt>
              <dd className="mt-1 text-sm text-admin-ink sm:mt-0 sm:col-span-2">
                {formatDateTime(booking.returnAt, lang)} - {booking.returnLocation}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-admin-muted">{dict.admin.bookingDetail.status}</dt>
              <dd className="mt-1 text-sm text-admin-ink sm:mt-0 sm:col-span-2">{tEnum(dict, "bookingStatus", booking.status)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-admin-muted">{dict.admin.bookingDetail.totalAmount}</dt>
              <dd className="mt-1 text-sm text-admin-ink sm:mt-0 sm:col-span-2 font-semibold">
                {formatCurrency(Number(booking.totalPrice), lang)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-admin-line bg-admin-surface">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-base font-medium text-admin-ink">{t.title}</h3>
        </div>
        <div className="border-t border-admin-line px-4 py-5 sm:px-6">
          {booking.payments.length === 0 ? (
            <p className="text-sm text-admin-muted">{t.none}</p>
          ) : (
            <ul className="divide-y divide-admin-line">
              {booking.payments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="text-admin-muted">{formatDateTime(payment.paidAt, lang)}</span>
                  <span className="text-admin-muted-2">{tEnum(dict, "paymentMethod", payment.method)}</span>
                  <span className="text-admin-muted">{payment.reference || "-"}</span>
                  <span className="font-medium text-admin-ink">
                    {formatCurrency(Number(payment.amount), lang)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <dl className="mt-4 space-y-2 border-t border-admin-line pt-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-admin-muted">{t.collected}</dt>
              <dd className="font-medium text-admin-ink">{formatCurrency(collected, lang)}</dd>
            </div>
            {!closed && (
              <div className="flex items-center justify-between">
                <dt className="text-admin-muted">{t.remaining}</dt>
                <dd className="font-medium text-admin-ink">{formatCurrency(remaining, lang)}</dd>
              </div>
            )}
          </dl>
          {!closed && remaining <= 0.001 && (
            <p className="mt-3 text-sm text-admin-success">{t.fullyPaid}</p>
          )}
        </div>
      </div>

      {!closed && remaining > 0.001 && (
        <div className="mt-6">
          <PaymentForm lang={lang} bookingId={booking.id} remaining={remaining} />
        </div>
      )}

      <div className="mt-6">
        <BookingActions lang={lang} bookingId={booking.id} status={booking.status} />
      </div>
    </div>
  );
}
