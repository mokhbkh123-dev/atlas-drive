import { prisma } from "@/lib/prisma";
import BookingForm from "./BookingForm";
import { notFound } from "next/navigation";
import { cityParam, cityName, getDict, resolveLocale } from "@/i18n";
import { getOwnerWhatsAppNumber } from "@/lib/whatsapp";
import { dateParam } from "@/lib/utils";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    carId?: string;
    pickupDate?: string;
    returnDate?: string;
    city?: string;
  }>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  const { carId, pickupDate, returnDate, city: rawCity } = await searchParams;
  const city = cityParam(rawCity);

  let car = null;
  if (carId) {
    car = await prisma.car.findUnique({
      where: { id: carId },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    if (!car) {
      car = await prisma.car.findUnique({
        where: { slug: carId },
        include: { images: { orderBy: { sortOrder: "asc" } } },
      });
    }
    if (!car || car.status !== "PUBLISHED") {
      notFound();
    }
  }

  const cars = await prisma.car.findMany({
    where: { status: "PUBLISHED" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { name: "asc" },
  });

  // Catalogue prices stay on the server: the request form shows duration only.
  const serializedCars = cars.map((c) => ({
    id: c.id,
    slug: c.slug,
    brand: c.brand,
    model: c.model,
    name: c.name,
    images: c.images?.map((img) => ({
      url: img.url,
      isPrimary: img.isPrimary,
    })),
  }));

  const whatsappNumber = await getOwnerWhatsAppNumber();

  return (
    <div className="bg-cream">
      <section className="relative overflow-hidden border-b border-line bg-cream-2 py-12 sm:py-16">
        <div aria-hidden className="paper-grid absolute inset-0 opacity-70" />
        <div className="container-site relative text-center">
          <p className="eyebrow eyebrow-center justify-center">{dict.booking.eyebrow}</p>
          <h1 className="heading-display mt-4 text-balance text-3xl sm:text-4xl lg:text-5xl">
            {dict.booking.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
            {dict.booking.subtitle}
          </p>
        </div>
      </section>

      <section className="container-site py-10 sm:py-12 lg:py-16">
        <BookingForm
          cars={serializedCars}
          selectedCarId={car?.id ?? carId}
          lang={lang}
          whatsappNumber={whatsappNumber}
          initialPickupAt={dateParam(pickupDate)}
          initialReturnAt={dateParam(returnDate)}
          initialPickupLocation={city ? cityName(dict, city) : undefined}
        />
      </section>
    </div>
  );
}
