import { prisma } from "@/lib/prisma";
import BookingForm from "./BookingForm";
import { notFound } from "next/navigation";
import { getDict, resolveLocale } from "@/i18n";
import { getOwnerWhatsAppNumber } from "@/lib/whatsapp";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ carId?: string }>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  const { carId } = await searchParams;
  
  let car = null;
  if (carId) {
    car = await prisma.car.findUnique({
      where: { id: carId },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    if (!car) {
      // Try by slug if id not found
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

  const serializedCars = cars.map(c => ({
    id: c.id,
    slug: c.slug,
    brand: c.brand,
    model: c.model,
    name: c.name,
    dailyPrice: c.dailyPrice.toString(),
    images: c.images?.map(img => ({
      url: img.url,
      isPrimary: img.isPrimary,
    })),
  }));

  const whatsappNumber = await getOwnerWhatsAppNumber();

  return (
    <div className="bg-[#050505]">
      <div className="container-luxe max-w-6xl py-10 sm:py-14 lg:py-16">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <p className="eyebrow eyebrow-center justify-center">{dict.booking.eyebrow}</p>
          <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-ivory sm:text-4xl lg:text-5xl">
            {dict.booking.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/55 sm:text-base">
            {dict.booking.subtitle}
          </p>
        </div>
        <BookingForm
          cars={serializedCars}
          selectedCarId={car?.id ?? carId}
          lang={lang}
          whatsappNumber={whatsappNumber}
        />
      </div>
    </div>
  );
}
