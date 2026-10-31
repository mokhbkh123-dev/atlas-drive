import Link from "next/link";
import { Users, UserPlus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { resolveLocale } from "@/i18n";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "customers");

  let customers: any[] = [];
  try {
    customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        bookings: {
          select: { id: true, status: true, totalPrice: true, pickupAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      take: 200,
    });
  } catch (error) {
    console.error("Load customers error:", error);
  }

  const formatDate = (d: Date) => d.toLocaleDateString(lang === "ar" ? "ar-MA" : lang === "en" ? "en-GB" : "fr-FR");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#f4f5f7]">Clients</h1>
        <Link href={`/${lang}/admin/customers/new`} className="inline-flex items-center gap-2 rounded-lg bg-[#e5b94f] px-3 py-2 text-sm font-medium text-black hover:bg-[#f6d57a]">
          <UserPlus className="h-4 w-4" />
          Nouveau client
        </Link>
      </div>

      <div className="rounded-xl border border-[#202c3a] bg-[#0d141e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#111b27]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#b5c0cd]">Nom</th>
                <th className="px-4 py-3 text-left font-medium text-[#b5c0cd]">Téléphone</th>
                <th className="px-4 py-3 text-left font-medium text-[#b5c0cd]">Email</th>
                <th className="px-4 py-3 text-left font-medium text-[#b5c0cd]">Dernière réservation</th>
                <th className="px-4 py-3 text-left font-medium text-[#b5c0cd]">Ajouté le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202c3a]">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#8190a1]">
                    <Users className="mx-auto mb-2 h-6 w-6" />
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#111b27]/60">
                    <td className="px-4 py-3 text-[#f4f5f7]">{c.name}</td>
                    <td className="px-4 py-3 text-[#b5c0cd]">{c.phone}</td>
                    <td className="px-4 py-3 text-[#b5c0cd]">{c.email || "—"}</td>
                    <td className="px-4 py-3 text-[#b5c0cd]">{c.bookings[0] ? formatDate(c.bookings[0].pickupAt) : "—"}</td>
                    <td className="px-4 py-3 text-[#b5c0cd]">{formatDate(c.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
