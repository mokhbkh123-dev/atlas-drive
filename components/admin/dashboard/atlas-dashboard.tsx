"use client";

import Link from "next/link";
import { Car, CalendarDays, Users, ArrowRight, TrendingUp } from "lucide-react";

type Stats = {
  totalCars: number;
  totalBookings: number;
  revenue: number;
  totalCustomers: number;
};

type RecentBooking = {
  id: string;
  customerName: string;
  carName: string;
  pickupAt: Date;
  returnAt: Date;
  status: string;
  totalPrice: number;
  publicRef: string;
};

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  CONFIRMED: { bg: "bg-[#27d99a]/10", text: "text-[#27d99a]", label: "Confirmée" },
  READY_FOR_PICKUP: { bg: "bg-[#27d99a]/10", text: "text-[#27d99a]", label: "Confirmée" },
  IN_PROGRESS: { bg: "bg-[#27d99a]/10", text: "text-[#27d99a]", label: "Confirmée" },
  COMPLETED: { bg: "bg-[#27d99a]/10", text: "text-[#27d99a]", label: "Confirmée" },
  PENDING: { bg: "bg-[#f4c34f]/10", text: "text-[#f4c34f]", label: "En attente" },
  CANCELLED: { bg: "bg-[#fa655e]/10", text: "text-[#fa655e]", label: "Annulée" },
  REJECTED: { bg: "bg-[#fa655e]/10", text: "text-[#fa655e]", label: "Annulée" },
};

export default function AtlasDashboard({
  lang,
  stats,
  statusCounts,
  recentBookings,
}: {
  lang: string;
  stats: Stats;
  statusCounts: { CONFIRMED: number; PENDING: number; CANCELLED: number };
  recentBookings: RecentBooking[];
}) {
  const total = statusCounts.CONFIRMED + statusCounts.PENDING + statusCounts.CANCELLED || 1;
  const confirmedPct = Math.round((statusCounts.CONFIRMED / total) * 100);
  const pendingPct = Math.round((statusCounts.PENDING / total) * 100);
  const cancelledPct = Math.round((statusCounts.CANCELLED / total) * 100);

  const formatDateRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })} - ${end.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5b94f]/10">
                <Car className="h-5 w-5 text-[#e5b94f]" />
              </div>
              <div>
                <p className="text-xs text-[#8190a1]">Total voitures</p>
                <p className="mt-1 text-2xl font-semibold text-[#f4f5f7]">{stats.totalCars}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-[#27d99a]">
            <TrendingUp className="h-3 w-3" />
            <span>+12% ce mois</span>
          </div>
        </div>

        <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5b94f]/10">
                <CalendarDays className="h-5 w-5 text-[#e5b94f]" />
              </div>
              <div>
                <p className="text-xs text-[#8190a1]">Réservations</p>
                <p className="mt-1 text-2xl font-semibold text-[#f4f5f7]">{stats.totalBookings}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-[#27d99a]">
            <TrendingUp className="h-3 w-3" />
            <span>+8% ce mois</span>
          </div>
        </div>

        <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5b94f]/10">
                <span className="text-sm font-bold text-[#e5b94f]">MAD</span>
              </div>
              <div>
                <p className="text-xs text-[#8190a1]">Revenus</p>
                <p className="mt-1 text-xl font-semibold text-[#f4f5f7]">{stats.revenue.toLocaleString("fr-FR")} MAD</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-[#27d99a]">
            <TrendingUp className="h-3 w-3" />
            <span>+15% ce mois</span>
          </div>
        </div>

        <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5b94f]/10">
                <Users className="h-5 w-5 text-[#e5b94f]" />
              </div>
              <div>
                <p className="text-xs text-[#8190a1]">Clients</p>
                <p className="mt-1 text-2xl font-semibold text-[#f4f5f7]">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-[#27d99a]">
            <TrendingUp className="h-3 w-3" />
            <span>+5% ce mois</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] xl:col-span-3">
          <div className="flex items-center justify-between border-b border-[#202c3a] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#f4f5f7]">Évolution des réservations</h3>
            <button className="rounded border border-[#202c3a] px-2 py-1 text-xs text-[#b5c0cd]">7 derniers mois</button>
          </div>
          <div className="p-4">
            <svg viewBox="0 0 400 160" className="h-48 w-full">
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e5b94f" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#e5b94f" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="30" y1="20" x2="30" y2="120" stroke="#202c3a" strokeWidth="1" />
              <line x1="30" y1="120" x2="380" y2="120" stroke="#202c3a" strokeWidth="1" />
              <path d="M 30 90 L 80 70 L 130 75 L 180 55 L 230 65 L 280 40 L 330 50 L 380 35 L 380 120 L 30 120 Z" fill="url(#goldGradient)" />
              <polyline points="30,90 80,70 130,75 180,55 230,65 280,40 330,50 380,35" fill="none" stroke="#e5b94f" strokeWidth="2" />
              <circle cx="30" cy="90" r="3" fill="#e5b94f" />
              <circle cx="80" cy="70" r="3" fill="#e5b94f" />
              <circle cx="130" cy="75" r="3" fill="#e5b94f" />
              <circle cx="180" cy="55" r="3" fill="#e5b94f" />
              <circle cx="230" cy="65" r="3" fill="#e5b94f" />
              <circle cx="280" cy="40" r="3" fill="#e5b94f" />
              <circle cx="330" cy="50" r="3" fill="#e5b94f" />
              <circle cx="380" cy="35" r="3" fill="#e5b94f" />
            </svg>
            <div className="mt-2 flex justify-between text-[10px] text-[#8190a1] px-7">
              <span>Jan</span><span>Fév</span><span>Mar</span><span>Avr</span><span>Mai</span><span>Jun</span><span>Jul</span><span>Août</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] xl:col-span-2">
          <div className="border-b border-[#202c3a] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#f4f5f7]">Statut des réservations</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 42 42" className="h-32 w-32">
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#1a2332" strokeWidth="3"></circle>
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e5b94f" strokeWidth="3" strokeDasharray={`${confirmedPct} ${100 - confirmedPct}`} strokeDashoffset="25"></circle>
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#a9b2bf" strokeWidth="3" strokeDasharray={`${pendingPct} ${100 - pendingPct}`} strokeDashoffset={`${25 - confirmedPct}`}></circle>
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#fa655e" strokeWidth="3" strokeDasharray={`${cancelledPct} ${100 - cancelledPct}`} strokeDashoffset={`${25 - confirmedPct - pendingPct}`}></circle>
                <text x="21" y="23" textAnchor="middle" className="fill-[#f4f5f7] text-[10px] font-semibold">{total}</text>
                <text x="21" y="29" textAnchor="middle" className="fill-[#8190a1] text-[6px]">Total</text>
              </svg>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#e5b94f]" />
                  <span className="text-[#b5c0cd]">Confirmées</span>
                </div>
                <span className="text-[#f4f5f7]">{statusCounts.CONFIRMED} ({confirmedPct}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#a9b2bf]" />
                  <span className="text-[#b5c0cd]">En attente</span>
                </div>
                <span className="text-[#f4f5f7]">{statusCounts.PENDING} ({pendingPct}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#fa655e]" />
                  <span className="text-[#b5c0cd]">Annulées</span>
                </div>
                <span className="text-[#f4f5f7]">{statusCounts.CANCELLED} ({cancelledPct}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] xl:col-span-2">
          <div className="flex items-center justify-between border-b border-[#202c3a] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#f4f5f7]">Réservations récentes</h3>
            <Link href={`/${lang}/admin/bookings`} className="flex items-center gap-1 text-xs text-[#e5b94f] hover:text-[#f6d57a]">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#202c3a]">
                  <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Client</th>
                  <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Voiture</th>
                  <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Dates</th>
                  <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Statut</th>
                  <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-[#8190a1]">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202c3a]/50">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-xs text-[#8190a1]">Aucune réservation</td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => {
                    const style = statusStyles[booking.status] || statusStyles.PENDING;
                    return (
                      <tr key={booking.id} className="hover:bg-admin-surface/2">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a2332] text-xs text-[#e5b94f]">
                              {booking.customerName.split(' ').map((n) => n[0]).join('').slice(0,2).toUpperCase()}
                            </div>
                            <span className="text-xs text-[#f4f5f7]">{booking.customerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#b5c0cd]">{booking.carName}</td>
                        <td className="px-4 py-3 text-xs text-[#b5c0cd]">{formatDateRange(booking.pickupAt, booking.returnAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${style.bg} ${style.text}`}>{style.label}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-[#f4f5f7]">{booking.totalPrice.toLocaleString("fr-FR")} MAD</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-[#202c3a] bg-[#0d141e] overflow-hidden">
          <div className="relative h-full min-h-[280px]">
            <img src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=800&auto=format&fit=crop" alt="Luxury SUV" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-xs font-bold tracking-widest text-[#e5b94f] mb-1">ATLAS DRIVE</p>
              <p className="text-sm text-white mb-3">Votre mobilité, notre priorité</p>
              <Link href={`/${lang}/admin/cars`} className="inline-flex items-center gap-1 rounded bg-[#e5b94f] px-3 py-1.5 text-xs font-medium text-[#0a0a0a] hover:bg-[#f6d57a] transition-colors">
                Gérer les voitures <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
