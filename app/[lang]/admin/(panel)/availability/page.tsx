import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { resolveLocale } from "@/i18n";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAvailabilityPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "availability");
  const today = new Date();

  const [cars, bookings] = await Promise.all([
    prisma.car.findMany({
      where: { status: "PUBLISHED" },
      include: { location: true },
      orderBy: [{ brand: "asc" }, { model: "asc" }],
    }),
    prisma.booking.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED", "READY_FOR_PICKUP", "IN_PROGRESS"] },
        returnAt: { gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) },
      },
      include: { car: true },
      orderBy: { pickupAt: "asc" },
    }),
  ]);

  // Group bookings by car
  const bookingsByCar = new Map<string, typeof bookings>();
  for (const booking of bookings) {
    const list = bookingsByCar.get(booking.carId) || [];
    list.push(booking);
    bookingsByCar.set(booking.carId, list);
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            {lang === "ar" ? "التوفر" : lang === "en" ? "Availability" : "Disponibilités"}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {lang === "ar"
              ? "حالة توفر المركبات بناءً على الحجوزات الحالية"
              : lang === "en"
              ? "Vehicle availability based on current reservations"
              : "Disponibilité des véhicules selon les réservations en cours"}
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-6">
        {cars.map((car) => {
          const carBookings = bookingsByCar.get(car.id) || [];
          const isAvailable = carBookings.length === 0;

          return (
            <div
              key={car.id}
              className="bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-hidden"
            >
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {car.name || `${car.brand} ${car.model}`}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {car.category} • {car.transmission} • {car.fuelType} • {car.seats}{" "}
                    {lang === "ar" ? "مقاعد" : lang === "en" ? "seats" : "places"}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    isAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {isAvailable
                    ? lang === "ar"
                      ? "متوفر"
                      : lang === "en"
                      ? "Available"
                      : "Disponible"
                    : lang === "ar"
                    ? "محجوز"
                    : lang === "en"
                    ? "Booked"
                    : "Réservé"}
                </span>
              </div>
              {carBookings.length > 0 && (
                <div className="border-t border-gray-200">
                  <dl>
                    {carBookings.map((booking, idx) => (
                      <div
                        key={booking.id}
                        className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${
                          idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <dt className="text-sm font-medium text-gray-500">
                          {lang === "ar" ? "الحجز" : lang === "en" ? "Booking" : "Réservation"}{" "}
                          {booking.publicRef}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {booking.customerName} •{" "}
                          {lang === "ar" ? "الاستلام" : lang === "en" ? "Pickup" : "Prise en charge"}:{" "}
                          {formatDate(booking.pickupAt, lang)} •{" "}
                          {lang === "ar" ? "العودة" : lang === "en" ? "Return" : "Retour"}:{" "}
                          {formatDate(booking.returnAt, lang)} •{" "}
                          <span className="font-medium">{booking.status}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
