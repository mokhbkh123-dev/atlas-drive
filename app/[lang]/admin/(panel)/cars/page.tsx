import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Car } from "lucide-react";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { getDict, resolveLocale } from "@/i18n";

const ACTIVE_BOOKING_STATUSES = [
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "IN_PROGRESS",
] as const;

export default async function AdminCarsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "fleet");

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const cars = await prisma.car.findMany({
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      location: { select: { id: true, name: true, city: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const carIds = cars.map((car) => car.id);

  const [activeBookings, activeMaintenance] = await Promise.all([
    prisma.booking.findMany({
      where: {
        carId: { in: carIds },
        status: { in: [...ACTIVE_BOOKING_STATUSES] },
        pickupAt: { lte: now },
        returnAt: { gte: now },
      },
      select: { carId: true },
    }),
    prisma.maintenance.findMany({
      where: {
        carId: { in: carIds },
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        startAt: { lte: endOfToday },
        endAt: { gte: startOfToday },
      },
      select: { carId: true },
    }),
  ]);

  const rentedCarIds = new Set(activeBookings.map((booking) => booking.carId));
  const maintenanceCarIds = new Set(
    activeMaintenance.map((maintenance) => maintenance.carId)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#f4f5f7]">Gestion des voitures</h1>
        <Link
          href={`/${lang}/admin/cars/new`}
          className="inline-flex items-center gap-1.5 rounded bg-[#e5b94f] px-3 py-1.5 text-xs font-medium text-[#0a0a0a] hover:bg-[#f6d57a] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter une voiture
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8190a1]" />
          <input
            type="text"
            placeholder="Rechercher une voiture..."
            className="w-full rounded border border-[#202c3a] bg-[#0d141e] py-1.5 pl-8 pr-3 text-xs text-[#f4f5f7] placeholder:text-[#8190a1] focus:border-[#e5b94f]/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#202c3a]">
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Photo</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Modèle</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Catégorie</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Prix/jour</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Statut</th>
                <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202c3a]/50">
              {cars.map((car) => {
                const primary = car.images.find((image) => image.isPrimary) ?? car.images[0] ?? null;
                const isRented = rentedCarIds.has(car.id);
                const isMaintenance = maintenanceCarIds.has(car.id);
                const status = isRented ? "Louée" : isMaintenance ? "Maintenance" : "Disponible";
                const statusStyle = isRented
                  ? "bg-[#f4c34f]/10 text-[#f4c34f]"
                  : isMaintenance
                    ? "bg-[#a9b2bf]/10 text-[#a9b2bf]"
                    : "bg-[#27d99a]/10 text-[#27d99a]";
                const carName = car.name || `${car.brand} ${car.model}`;

                return (
                  <tr key={car.id} className="hover:bg-white/2">
                    <td className="px-4 py-2">
                      <div className="h-10 w-16 overflow-hidden rounded bg-[#111b27]">
                        {primary?.url ? (
                          <img src={primary.url} alt={carName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Car className="h-4 w-4 text-[#8190a1]" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-xs text-[#f4f5f7]">{carName}</div>
                      <div className="text-[10px] text-[#8190a1]">{car.year} • {car.plateNumber || car.brand}</div>
                    </td>
                    <td className="px-4 py-2 text-xs text-[#b5c0cd]">{car.category || "-"}</td>
                    <td className="px-4 py-2 text-xs text-[#f4f5f7]">{Number(car.dailyPrice).toLocaleString("fr-FR")} MAD</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${statusStyle}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/${lang}/admin/cars/${car.id}`} className="rounded p-1 text-[#8190a1] hover:bg-white/5 hover:text-[#e5b94f]">
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button className="rounded p-1 text-[#8190a1] hover:bg-white/5 hover:text-[#fa655e]">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
