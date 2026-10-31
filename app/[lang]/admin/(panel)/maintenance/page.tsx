import Link from "next/link";
import { Plus, Pencil, Trash2, Car } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { resolveLocale } from "@/i18n";

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  SCHEDULED: { bg: "bg-[#f4c34f]/10", text: "text-[#f4c34f]", label: "À venir" },
  IN_PROGRESS: { bg: "bg-[#a9b2bf]/10", text: "text-[#a9b2bf]", label: "En cours" },
  COMPLETED: { bg: "bg-[#27d99a]/10", text: "text-[#27d99a]", label: "Terminée" },
  CANCELLED: { bg: "bg-[#fa655e]/10", text: "text-[#fa655e]", label: "Annulée" },
};

export default async function AdminMaintenancePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "maintenance");

  let maintenances: any[] = [];
  try {
    maintenances = await prisma.maintenance.findMany({
      orderBy: [{ status: "asc" }, { startAt: "asc" }],
      include: {
        car: {
          select: { id: true, name: true, brand: true, model: true, plateNumber: true },
        },
      },
    }) as any[];
  } catch (error) {
    console.error("Load maintenances error:", error);
    maintenances = [];
  }

  const formatDate = (d: Date) => d.toLocaleDateString("fr-FR");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#f4f5f7]">Maintenance</h1>
        <Link href={`/${lang}/admin/maintenance/new`} className="inline-flex items-center gap-1.5 rounded bg-[#e5b94f] px-3 py-1.5 text-xs font-medium text-[#0a0a0a] hover:bg-[#f6d57a] transition-colors">
          <Plus className="h-3.5 w-3.5" />
          Ajouter une maintenance
        </Link>
      </div>

      <div className="flex items-center gap-1 rounded border border-[#202c3a] bg-[#0d141e] p-1 w-fit">
        <button className="rounded bg-[#e5b94f] px-3 py-1 text-xs font-medium text-[#0a0a0a]">À venir</button>
        <button className="rounded px-3 py-1 text-xs text-[#b5c0cd] hover:text-[#f4f5f7]">En cours</button>
        <button className="rounded px-3 py-1 text-xs text-[#b5c0cd] hover:text-[#f4f5f7]">Terminées</button>
      </div>

      <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#202c3a]">
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Voiture</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Type</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Date prévue</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Statut</th>
                <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202c3a]/50">
              {maintenances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-xs text-[#8190a1]">Aucune maintenance</td>
                </tr>
              ) : (
                maintenances.map((m) => {
                  const style = statusStyles[m.status] || statusStyles.SCHEDULED;
                  const carName = m.car ? (m.car.name || `${m.car.brand} ${m.car.model}`) : "-";
                  const type = m.type === "OIL_CHANGE" ? "Vidange" : m.type === "TIRE_CHANGE" ? "Pneus" : m.type === "INSPECTION" ? "Révision" : m.type === "REPAIR" ? "Réparation" : m.type;
                  return (
                    <tr key={m.id} className="hover:bg-white/2">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-12 items-center justify-center rounded bg-[#111b27]">
                            <Car className="h-4 w-4 text-[#8190a1]" />
                          </div>
                          <span className="text-xs text-[#f4f5f7]">{carName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-[#b5c0cd]">{type}</td>
                      <td className="px-4 py-2.5 text-xs text-[#b5c0cd]">{formatDate(m.startAt)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="rounded p-1 text-[#8190a1] hover:bg-white/5 hover:text-[#e5b94f]">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button className="rounded p-1 text-[#8190a1] hover:bg-white/5 hover:text-[#fa655e]">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
