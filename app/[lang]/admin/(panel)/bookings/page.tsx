import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import Link from "next/link";
import { resolveLocale } from "@/i18n";
import { Eye, Edit, Trash2, Search } from "lucide-react";

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-[#f4c34f]/10", text: "text-[#f4c34f]", label: "En attente" },
  CONFIRMED: { bg: "bg-[#27d99a]/10", text: "text-[#27d99a]", label: "Confirmée" },
  READY_FOR_PICKUP: { bg: "bg-[#27d99a]/10", text: "text-[#27d99a]", label: "Confirmée" },
  IN_PROGRESS: { bg: "bg-[#27d99a]/10", text: "text-[#27d99a]", label: "Confirmée" },
  COMPLETED: { bg: "bg-[#27d99a]/10", text: "text-[#27d99a]", label: "Confirmée" },
  REJECTED: { bg: "bg-[#fa655e]/10", text: "text-[#fa655e]", label: "Annulée" },
  CANCELLED: { bg: "bg-[#fa655e]/10", text: "text-[#fa655e]", label: "Annulée" },
};

export default async function AdminBookingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "reservations");

  const bookings = await prisma.booking.findMany({
    include: { car: true },
    orderBy: { createdAt: "desc" },
  });

  const formatDate = (d: Date) => d.toLocaleDateString("fr-FR");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#f4f5f7]">Réservations</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select className="rounded border border-[#202c3a] bg-[#0d141e] px-2 py-1.5 text-xs text-[#b5c0cd]">
          <option>Tous les statuts</option>
        </select>
        <select className="rounded border border-[#202c3a] bg-[#0d141e] px-2 py-1.5 text-xs text-[#b5c0cd]">
          <option>Toutes les voitures</option>
        </select>
        <input type="text" placeholder="dd/mm/yyyy" className="rounded border border-[#202c3a] bg-[#0d141e] px-2 py-1.5 text-xs text-[#b5c0cd] w-28" />
        <input type="text" placeholder="dd/mm/yyyy" className="rounded border border-[#202c3a] bg-[#0d141e] px-2 py-1.5 text-xs text-[#b5c0cd] w-28" />
        <button className="rounded bg-[#e5b94f] px-3 py-1.5 text-xs font-medium text-[#0a0a0a] hover:bg-[#f6d57a]">
          Rechercher
        </button>
      </div>

      <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#202c3a]">
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">N°</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Client</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Voiture</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Dates</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Statut</th>
                <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Montant</th>
                <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202c3a]/50">
              {bookings.map((booking, idx) => {
                const style = statusStyles[booking.status] || statusStyles.PENDING;
                const carName = booking.car ? (booking.car.name || `${booking.car.brand} ${booking.car.model}`) : "-";
                return (
                  <tr key={booking.id} className="hover:bg-white/2">
                    <td className="px-4 py-2.5 text-xs text-[#b5c0cd]">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a2332] text-xs text-[#e5b94f]">
                          {booking.customerName.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <span className="text-xs text-[#f4f5f7]">{booking.customerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[#b5c0cd]">{carName}</td>
                    <td className="px-4 py-2.5 text-xs text-[#b5c0cd]">{formatDate(booking.pickupAt)} - {formatDate(booking.returnAt)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-[#f4f5f7]">{Number(booking.totalPrice).toLocaleString("fr-FR")} MAD</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/${lang}/admin/bookings/${booking.id}`} className="rounded p-1 text-[#8190a1] hover:bg-white/5 hover:text-[#e5b94f]">
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <Link href={`/${lang}/admin/bookings/${booking.id}`} className="rounded p-1 text-[#8190a1] hover:bg-white/5 hover:text-[#e5b94f]">
                          <Edit className="h-3.5 w-3.5" />
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
