import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireModule } from "@/lib/rbac";
import { resolveLocale, getDict, tEnum } from "@/i18n";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/admin/ui";
import { buttonClass } from "@/components/admin/ui/button";
import CarForm from "@/components/admin/fleet/CarForm";
import { CarGallery } from "@/components/admin/fleet/CarGallery";
import { CarDetailActions } from "@/components/admin/fleet/CarDetailActions";
import { FleetDetailTabs } from "@/components/admin/fleet/FleetDetailTabs";
import { parseFeatures, carStatusTone } from "@/components/admin/fleet/helpers";
import type { CarFormCar } from "@/components/admin/fleet/types";

export default async function CarDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "fleet");
  const dict = getDict(lang);
  const { id } = await params;

  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      location: true,
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          publicRef: true,
          customerName: true,
          pickupAt: true,
          returnAt: true,
          status: true,
          totalPrice: true,
        },
      },
      maintenances: {
        orderBy: { startAt: "desc" },
        take: 50,
        select: {
          id: true,
          type: true,
          startAt: true,
          endAt: true,
          cost: true,
          status: true,
          provider: true,
        },
      },
    },
  });

  if (!car) {
    notFound();
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const activeBookingWindows = await prisma.booking.findMany({
    where: {
      carId: id,
      status: { in: ["CONFIRMED", "READY_FOR_PICKUP", "IN_PROGRESS"] },
      pickupAt: { lte: thirtyDaysLater },
      returnAt: { gte: thirtyDaysAgo },
    },
    select: { id: true, publicRef: true, pickupAt: true, returnAt: true, status: true },
    orderBy: { pickupAt: "asc" },
  });

  const maintenanceWindows = await prisma.maintenance.findMany({
    where: {
      carId: id,
      status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      startAt: { lte: thirtyDaysLater },
      endAt: { gte: thirtyDaysAgo },
    },
    select: { id: true, type: true, startAt: true, endAt: true, status: true, provider: true },
    orderBy: { startAt: "asc" },
  });

  const completedRevenueAgg = await prisma.booking.aggregate({
    where: { carId: id, status: "COMPLETED" },
    _sum: { totalPrice: true },
    _count: { _all: true },
  });

  const paymentsReceivedAgg = await prisma.payment.aggregate({
    where: {
      booking: { carId: id },
      status: { in: ["PAID", "PARTIAL"] },
    },
    _sum: { amount: true },
  });

  const features = parseFeatures(car.features);
  const images = car.images.map((img) => ({ url: img.url, alt: img.alt || "" }));

  const formCar: CarFormCar = {
    id: car.id,
    brand: car.brand,
    model: car.model,
    name: car.name,
    year: car.year,
    category: car.category,
    transmission: car.transmission,
    fuelType: car.fuelType,
    seats: car.seats,
    doors: car.doors,
    dailyPrice: Number(car.dailyPrice),
    weeklyPrice: car.weeklyPrice ? Number(car.weeklyPrice) : null,
    monthlyPrice: car.monthlyPrice ? Number(car.monthlyPrice) : null,
    deposit: Number(car.deposit),
    description: car.description,
    plateNumber: car.plateNumber,
    vin: car.vin,
    airConditioning: car.airConditioning,
    mileage: car.mileage ? Number(car.mileage) : null,
    features,
    locationId: car.locationId,
    locationName: car.location ? `${car.location.name}${car.location.city ? `, ${car.location.city}` : ""}` : null,
    status: car.status,
    images,
  };

  const bookingsRows = car.bookings.map((b) => ({
    id: b.id,
    publicRef: b.publicRef,
    customerName: b.customerName,
    pickupAt: b.pickupAt.toISOString(),
    returnAt: b.returnAt.toISOString(),
    status: b.status,
    totalPrice: Number(b.totalPrice),
  }));

  const maintenancesRows = car.maintenances.map((m) => ({
    id: m.id,
    type: m.type,
    startAt: m.startAt.toISOString(),
    endAt: m.endAt.toISOString(),
    cost: Number(m.cost),
    status: m.status,
    provider: m.provider,
  }));

  return (
    <div>
      <PageHeader
        title={car.name || `${car.brand} ${car.model}`}
        description={car.plateNumber ? `${dict.fleet.detail.specs.plate}: ${car.plateNumber}` : undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/${lang}/admin/cars`} className={buttonClass("ghost")}>
              {dict.fleet.detail.back}
            </Link>
            <CarDetailActions lang={lang} dict={dict} carId={car.id} status={car.status} />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={carStatusTone(car.status)}>
          {tEnum(dict, "carStatus", car.status)}
        </Badge>
        <Badge tone="info">{tEnum(dict, "category", car.category)}</Badge>
        <Badge tone="info">{tEnum(dict, "transmission", car.transmission)}</Badge>
        <Badge tone="info">{tEnum(dict, "fuel", car.fuelType)}</Badge>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CarGallery images={images} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{dict.fleet.detail.pricing.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-xs text-admin-muted">{dict.fleet.form.fields.dailyPrice}</div>
                <div className="mt-1 text-sm font-medium">
                  {formatCurrency(Number(car.dailyPrice), lang)}
                </div>
              </div>
              <div>
                <div className="text-xs text-admin-muted">{dict.fleet.form.fields.weeklyPrice}</div>
                <div className="mt-1 text-sm font-medium">
                  {car.weeklyPrice ? formatCurrency(Number(car.weeklyPrice), lang) : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-admin-muted">{dict.fleet.form.fields.monthlyPrice}</div>
                <div className="mt-1 text-sm font-medium">
                  {car.monthlyPrice ? formatCurrency(Number(car.monthlyPrice), lang) : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-admin-muted">{dict.fleet.form.fields.deposit}</div>
                <div className="mt-1 text-sm font-medium">
                  {formatCurrency(Number(car.deposit), lang)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{dict.fleet.detail.specs.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-xs text-admin-muted">{dict.fleet.form.fields.year}</div>
                <div className="mt-1 text-sm">{car.year || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-admin-muted">{dict.fleet.form.fields.seats}</div>
                <div className="mt-1 text-sm">{car.seats}</div>
              </div>
              <div>
                <div className="text-xs text-admin-muted">{dict.fleet.form.fields.doors}</div>
                <div className="mt-1 text-sm">{car.doors}</div>
              </div>
              <div>
                <div className="text-xs text-admin-muted">{dict.fleet.form.fields.mileage}</div>
                <div className="mt-1 text-sm">
                  {car.mileage ? `${car.mileage} ${dict.fleet.units.km}` : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-admin-muted">{dict.fleet.form.fields.vin}</div>
                <div className="mt-1 text-sm">{car.vin || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-admin-muted">{dict.fleet.form.fields.plateNumber}</div>
                <div className="mt-1 text-sm">{car.plateNumber || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-admin-muted">{dict.fleet.form.fields.location}</div>
                <div className="mt-1 text-sm">{formCar.locationName || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-admin-muted">{dict.fleet.form.fields.airConditioning}</div>
                <div className="mt-1 text-sm">{car.airConditioning ? dict.fleet.form.yes : dict.fleet.form.no}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{dict.fleet.detail.features.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {features.length === 0 ? (
                <div className="text-sm text-admin-muted">{dict.fleet.detail.features.empty}</div>
              ) : (
                <ul className="list-disc ps-5 text-sm space-y-1">
                  {features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{dict.fleet.detail.description.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm whitespace-pre-wrap">{car.description || dict.fleet.detail.description.empty}</div>
            </CardContent>
          </Card>

          <section id="edit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{dict.fleet.detail.editTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <CarForm lang={lang} car={formCar} />
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{dict.fleet.detail.availability.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium">{dict.fleet.detail.availability.bookings}</div>
                {activeBookingWindows.length === 0 ? (
                  <div className="text-xs text-admin-muted">{dict.fleet.detail.availability.emptyBookings}</div>
                ) : (
                  <ul className="mt-2 space-y-1 text-xs">
                    {activeBookingWindows.map((b) => (
                      <li key={b.id}>
                        {b.publicRef} — {formatDate(b.pickupAt, lang)} → {formatDate(b.returnAt, lang)} ({tEnum(dict, "bookingStatus", b.status)})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <div className="text-sm font-medium">{dict.fleet.detail.availability.maintenance}</div>
                {maintenanceWindows.length === 0 ? (
                  <div className="text-xs text-admin-muted">{dict.fleet.detail.availability.emptyMaintenance}</div>
                ) : (
                  <ul className="mt-2 space-y-1 text-xs">
                    {maintenanceWindows.map((m) => (
                      <li key={m.id}>
                        {m.type} — {formatDate(m.startAt, lang)} → {formatDate(m.endAt, lang)} ({tEnum(dict, "maintenanceStatus", m.status)})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          <FleetDetailTabs
            lang={lang}
            dict={dict}
            bookings={bookingsRows}
            maintenances={maintenancesRows}
            revenue={{
              completedRevenue: Number(completedRevenueAgg._sum?.totalPrice || 0),
              paymentsReceived: Number(paymentsReceivedAgg._sum?.amount || 0),
              completedCount: completedRevenueAgg._count._all || 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
