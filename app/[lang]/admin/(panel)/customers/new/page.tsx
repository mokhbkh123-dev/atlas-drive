import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

import { requireModule } from "@/lib/rbac";
import { resolveLocale } from "@/i18n";
import CustomerForm from "@/components/admin/customers/CustomerForm";

export default async function NewCustomerPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "customers");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href={`/${lang}/admin/customers`}
          className="inline-flex items-center gap-1 text-xs text-[#8190a1] hover:text-[#f4f5f7]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour
        </Link>
        <h1 className="text-lg font-semibold text-[#f4f5f7]">Nouveau client</h1>
      </div>

      <p className="flex items-center gap-2 text-sm text-[#8190a1]">
        <Users className="h-4 w-4" />
        Enregistrez un client dans le répertoire de l&apos;agence.
      </p>

      <CustomerForm lang={lang} />
    </div>
  );
}
