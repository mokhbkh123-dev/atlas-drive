import { BarChart3, Car, CalendarDays, Wallet } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { resolveLocale } from "@/i18n";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "reports");

  const [carsCount, bookingsCount, payments] = await Promise.all([
    prisma.car.count(),
    prisma.booking.count(),
    prisma.payment.findMany({
      where: { status: "PAID" },
      select: { amount: true },
    }),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const cards = [
    { label: "Véhicules", value: carsCount, icon: Car, color: "text-[#e5b94f]" },
    { label: "Réservations", value: bookingsCount, icon: CalendarDays, color: "text-[#27d99a]" },
    { label: "Recettes encaissées", value: `${totalRevenue.toLocaleString("fr-MA")} MAD`, icon: Wallet, color: "text-[#f4c34f]" },
    { label: "Rapports", value: "—", icon: BarChart3, color: "text-[#b5c0cd]" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#f4f5f7]">Rapports</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-[#202c3a] bg-[#0d141e] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8190a1]">{card.label}</p>
                <p className="mt-1 text-xl font-semibold text-[#f4f5f7]">{card.value}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#202c3a] bg-[#0d141e] p-6">
        <h2 className="mb-2 text-sm font-semibold text-[#f4f5f7]">Synthèse</h2>
        <p className="text-sm text-[#8190a1]">
          Vue d'ensemble des indicateurs clés. Les données sont calculées à partir de la base existante.
        </p>
      </div>
    </div>
  );
}
