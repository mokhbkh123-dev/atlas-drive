import { MapPin } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { getDict, resolveLocale } from "@/i18n";
import LocationsBoard, { type LocationRow } from "./LocationsBoard";

export const dynamic = "force-dynamic";

export default async function AdminLocationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "locations");
  const dict = getDict(lang);

  const records = await prisma.location.findMany({
    include: { _count: { select: { cars: true } } },
    orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
  });

  const rows: LocationRow[] = records.map((location) => ({
    id: location.id,
    name: location.name,
    city: location.city ?? "",
    address: location.address ?? "",
    phone: location.phone ?? "",
    email: location.email ?? "",
    isActive: location.isActive,
    isPrimary: location.isPrimary,
    carCount: location._count.cars,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-[#f4f5f7]">
          <MapPin className="h-5 w-5 text-[#e5b94f]" aria-hidden />
          {dict.locations.title}
        </h1>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-[#8190a1]">
          {dict.locations.subtitle}
        </p>
      </div>

      <LocationsBoard lang={lang} rows={rows} />
    </div>
  );
}
