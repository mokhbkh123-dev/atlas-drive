import { requireModule } from "@/lib/rbac";
import { getDict, resolveLocale } from "@/i18n";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CarForm from "@/components/admin/fleet/CarForm";

export default async function NewCarPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "fleet");

  const t = getDict(lang).fleet.form;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href={`/${lang}/admin/cars`}
          className="inline-flex items-center gap-1 text-xs text-admin-muted-2 hover:text-admin-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
          {t.back}
        </Link>
        <h1 className="text-lg font-semibold text-admin-ink">{t.newTitle}</h1>
      </div>
      <CarForm lang={lang} />
    </div>
  );
}
