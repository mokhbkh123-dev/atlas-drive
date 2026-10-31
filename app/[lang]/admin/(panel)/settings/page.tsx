import { Settings, Globe, Mail, Phone, MapPin } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { resolveLocale } from "@/i18n";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "settings");

  let settings: any[] = [];
  try {
    settings = await prisma.siteSetting.findMany({
      orderBy: { key: "asc" },
    });
  } catch (error) {
    console.error("Load settings error:", error);
  }

  const getValue = (key: string, fallback: string) => {
    const s = settings.find((x) => x.key === key);
    return s?.value || fallback;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#f4f5f7]">Paramètres</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#202c3a] bg-[#0d141e] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#e5b94f]" />
            <h2 className="text-sm font-semibold text-[#f4f5f7]">Informations du site</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-[#202c3a] pb-2">
              <span className="text-[#8190a1]">Nom du site</span>
              <span className="text-[#f4f5f7]">{getValue("site_name", "ATLAS DRIVE")}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#202c3a] pb-2">
              <span className="text-[#8190a1]">URL du site</span>
              <span className="text-[#f4f5f7]">{getValue("site_url", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#202c3a] pb-2">
              <span className="text-[#8190a1]">Devise</span>
              <span className="text-[#f4f5f7]">{getValue("currency", "MAD")}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#202c3a] bg-[#0d141e] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-[#e5b94f]" />
            <h2 className="text-sm font-semibold text-[#f4f5f7]">Contact</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-[#202c3a] pb-2">
              <span className="text-[#8190a1]">Téléphone</span>
              <span className="text-[#f4f5f7]">{getValue("contact_phone", process.env.WHATSAPP_NUMBER || "+212...")}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#202c3a] pb-2">
              <span className="text-[#8190a1]">Email</span>
              <span className="text-[#f4f5f7]">{getValue("contact_email", process.env.ADMIN_EMAIL || "admin@atlasdrive.ma")}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#202c3a] pb-2">
              <span className="text-[#8190a1]">Adresse</span>
              <span className="text-[#f4f5f7]">{getValue("contact_address", "—")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#202c3a] bg-[#0d141e] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#e5b94f]" />
          <h2 className="text-sm font-semibold text-[#f4f5f7]">Configuration</h2>
        </div>
        <p className="text-sm text-[#8190a1]">
          Les paramètres sont lus depuis la table SiteSetting. Vous pouvez les gérer via l'API d'administration existante.
        </p>
      </div>
    </div>
  );
}
