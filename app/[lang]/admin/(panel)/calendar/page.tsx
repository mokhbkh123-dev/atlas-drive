import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { resolveLocale, getDict, tEnum } from "@/i18n";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCalendarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "calendar");
  const dict = getDict(lang);

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED", "READY_FOR_PICKUP", "IN_PROGRESS", "COMPLETED"] },
    },
    include: { car: true },
    orderBy: { pickupAt: "asc" },
  });

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    READY_FOR_PICKUP: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-indigo-100 text-indigo-800",
    COMPLETED: "bg-purple-100 text-purple-800",
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            {lang === "ar" ? "التقويم" : lang === "en" ? "Calendar" : "Calendrier"}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {lang === "ar"
              ? "عرض جميع الحجوزات حسب تاريخ الاستلام"
              : lang === "en"
              ? "View all bookings by pickup date"
              : "Vue d'ensemble des réservations par date de prise en charge"}
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">
                      {dict.admin.bookings.table.reference}
                    </th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">
                      {dict.admin.bookings.table.customer}
                    </th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">
                      {dict.admin.bookings.table.vehicle}
                    </th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">
                      {dict.admin.bookings.table.dates}
                    </th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">
                      {dict.admin.bookings.table.amount}
                    </th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">
                      {dict.admin.bookings.table.status}
                    </th>
                    <th className="relative py-3.5 ps-3 pe-4 sm:pe-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                        {booking.publicRef}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        <div>{booking.customerName}</div>
                        <div className="text-gray-500">{booking.customerPhone}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {booking.car.name || `${booking.car.brand} ${booking.car.model}`}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div>
                          {lang === "ar" ? "الاستلام: " : lang === "en" ? "Pickup: " : "Prise en charge: "}
                          {formatDate(booking.pickupAt, lang)}
                        </div>
                        <div>
                          {lang === "ar" ? "العودة: " : lang === "en" ? "Return: " : "Retour: "}
                          {formatDate(booking.returnAt, lang)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {formatCurrency(Number(booking.totalPrice), lang)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            statusColors[booking.status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {tEnum(dict, "bookingStatus", booking.status)}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 ps-3 pe-4 text-end text-sm font-medium sm:pe-6">
                        <Link
                          href={`/${lang}/admin/bookings/${booking.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {dict.admin.bookings.details}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-500">
                  {lang === "ar" ? "لا توجد حجوزات" : lang === "en" ? "No bookings" : "Aucune réservation"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
