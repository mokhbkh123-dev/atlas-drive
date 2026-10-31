import Link from "next/link";
import { UserCog, UserPlus, ShieldCheck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { resolveLocale } from "@/i18n";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "staff");

  let users: any[] = [];
  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, lastLoginAt: true },
    });
  } catch (error) {
    console.error("Load users error:", error);
  }

  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString(lang === "ar" ? "ar-MA" : lang === "en" ? "en-GB" : "fr-FR") : "—";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#f4f5f7]">Utilisateurs</h1>
        <Link href={`/${lang}/admin/staff/new`} className="inline-flex items-center gap-2 rounded-lg bg-[#e5b94f] px-3 py-2 text-sm font-medium text-black hover:bg-[#f6d57a]">
          <UserPlus className="h-4 w-4" />
          Nouvel utilisateur
        </Link>
      </div>

      <div className="rounded-xl border border-[#202c3a] bg-[#0d141e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#111b27]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#b5c0cd]">Nom</th>
                <th className="px-4 py-3 text-left font-medium text-[#b5c0cd]">Email</th>
                <th className="px-4 py-3 text-left font-medium text-[#b5c0cd]">Rôle</th>
                <th className="px-4 py-3 text-left font-medium text-[#b5c0cd]">Statut</th>
                <th className="px-4 py-3 text-left font-medium text-[#b5c0cd]">Créé le</th>
                <th className="px-4 py-3 text-left font-medium text-[#b5c0cd]">Dernière connexion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202c3a]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#8190a1]">
                    <UserCog className="mx-auto mb-2 h-6 w-6" />
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#111b27]/60">
                    <td className="px-4 py-3 text-[#f4f5f7]">{u.name}</td>
                    <td className="px-4 py-3 text-[#b5c0cd]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#e5b94f]/10 px-2 py-0.5 text-xs text-[#e5b94f]">
                        <ShieldCheck className="h-3 w-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${u.isActive ? "bg-[#27d99a]/10 text-[#27d99a]" : "bg-[#fa655e]/10 text-[#fa655e]"}`}>
                        {u.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#b5c0cd]">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-[#b5c0cd]">{formatDate(u.lastLoginAt)}</td>
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
