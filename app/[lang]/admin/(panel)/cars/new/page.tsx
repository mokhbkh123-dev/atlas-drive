import { requireModule } from "@/lib/rbac";
import { resolveLocale } from "@/i18n";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CarForm from "@/components/admin/fleet/CarForm";

export default async function NewCarPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "fleet");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/${lang}/admin/cars`} className="inline-flex items-center gap-1 text-xs text-[#8190a1] hover:text-[#f4f5f7]">
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour
        </Link>
        <h1 className="text-lg font-semibold text-[#f4f5f7]">Ajouter une voiture</h1>
      </div>
      <CarForm lang={lang} />
    </div>
  );
}
