import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { requireModule } from "@/lib/rbac";
import { notFound } from "next/navigation";
import BookingActions from "./BookingActions";

import { resolveLocale, getDict, tEnum } from "@/i18n";

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "reservations");
  const dict = getDict(lang);
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { car: true },
  });

  if (!booking) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{dict.admin.bookingDetail.title}</h1>
        <p className="mt-1 text-sm text-gray-600">{dict.admin.bookingDetail.reference}: {booking.publicRef}</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{dict.admin.bookingDetail.customerInfo}</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{dict.admin.bookingDetail.fullName}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{booking.customerName}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{dict.admin.bookingDetail.phone}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{booking.customerPhone}</dd>
            </div>
            {booking.customerEmail && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{dict.admin.bookingDetail.email}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{booking.customerEmail}</dd>
              </div>
            )}
            {booking.customerNotes && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{dict.admin.bookingDetail.notes}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{booking.customerNotes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{dict.admin.bookingDetail.bookingInfo}</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{dict.admin.bookingDetail.vehicle}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {booking.car.name || `${booking.car.brand} ${booking.car.model}`}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{dict.admin.bookingDetail.pickup}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDateTime(booking.pickupAt, lang)} - {booking.pickupLocation}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{dict.admin.bookingDetail.returnLabel}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDateTime(booking.returnAt, lang)} - {booking.returnLocation}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{dict.admin.bookingDetail.status}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tEnum(dict, "bookingStatus", booking.status)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{dict.admin.bookingDetail.totalAmount}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold">
                {formatCurrency(Number(booking.totalPrice), lang)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <BookingActions lang={lang} bookingId={booking.id} status={booking.status} />
      </div>
    </div>
  );
}
