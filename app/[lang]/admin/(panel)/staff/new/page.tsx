import { requireModule } from "@/lib/rbac";
import { resolveLocale } from "@/i18n";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StaffForm from "@/components/admin/staff/StaffForm";

export default async function NewStaffPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "staff");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href={`/${lang}/admin/staff`}
          className="inline-flex items-center gap-1 text-xs text-[#8190a1] hover:text-[#f4f5f7]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour
        </Link>
        <h1 className="text-lg font-semibold text-[#f4f5f7]">Nouvel utilisateur</h1>
      </div>
      <StaffForm lang={lang} />
    </div>
  );
}
