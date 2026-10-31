import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { resolveLocale } from "@/i18n";
import BookingForm from "@/components/admin/bookings/BookingForm";

export const dynamic = "force-dynamic";

export default async function NewBookingPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "reservations");

  const cars = await prisma.car.findMany({
    where: { status: { in: ["PUBLISHED", "DRAFT"] } },
    orderBy: [{ brand: "asc" }, { model: "asc" }],
    select: {
      id: true,
      name: true,
      brand: true,
      model: true,
      plateNumber: true,
      dailyPrice: true,
      status: true,
    },
  });

  const carsForForm = cars.map((car) => ({
    ...car,
    dailyPrice: Number(car.dailyPrice),
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <BookingForm lang={lang} cars={carsForForm as any} />
    </div>
  );
}
