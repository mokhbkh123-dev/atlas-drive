import { redirect } from "next/navigation";
import { Wrench } from "lucide-react";

import { PageHeader } from "@/components/admin/ui";
import { getDict, resolveLocale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import MaintenanceForm from "@/components/admin/maintenance/MaintenanceForm";

export default async function NewMaintenancePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "maintenance");
  const dict = getDict(lang);
  const t = dict.maintenance;

  const cars = await prisma.car.findMany({
    orderBy: [{ brand: "asc" }, { model: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      brand: true,
      model: true,
      plateNumber: true,
    },
  }) as any[];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.newTitle}
        description={t.newSubtitle}
      />
      <MaintenanceForm lang={lang} cars={cars} />
    </div>
  );
}
