import Link from "next/link";
import { Plus, Wrench } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { getDict, resolveLocale, tEnum } from "@/i18n";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Badge,
  buttonClass,
  EmptyState,
  PageHeader,
  Table,
  TD,
  TH,
  TR,
} from "@/components/admin/ui";
import { maintenanceStatusTone } from "@/components/admin/fleet/helpers";

export default async function AdminMaintenancePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "maintenance");

  const dict = getDict(lang);
  const t = dict.maintenance;

  const maintenances = await prisma.maintenance.findMany({
    orderBy: [{ status: "asc" }, { startAt: "asc" }],
    include: {
      car: { select: { id: true, name: true, brand: true, model: true } },
    },
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title={t.title}
        description={t.subtitle}
        actions={
          <Link
            href={`/${lang}/admin/maintenance/new`}
            className={buttonClass("primary", "sm")}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            {t.new}
          </Link>
        }
      />

      {maintenances.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={t.empty}
          action={
            <Link
              href={`/${lang}/admin/maintenance/new`}
              className={buttonClass("secondary", "sm")}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              {t.new}
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-admin-line bg-admin-surface">
          <Table>
            <thead>
              <tr>
                <TH>{t.columns.vehicle}</TH>
                <TH>{t.columns.type}</TH>
                <TH>{t.columns.period}</TH>
                <TH>{t.columns.status}</TH>
                <TH className="text-end">{t.columns.cost}</TH>
              </tr>
            </thead>
            <tbody>
              {maintenances.map((m) => {
                const carName = m.car?.name || `${m.car?.brand ?? ""} ${m.car?.model ?? ""}`.trim();
                return (
                  <TR key={m.id}>
                    <TD>
                      {m.car ? (
                        <Link
                          href={`/${lang}/admin/cars/${m.car.id}`}
                          aria-label={`${t.viewVehicle} — ${carName}`}
                          className="text-sm font-medium text-admin-ink hover:text-admin-navy"
                        >
                          {carName}
                        </Link>
                      ) : (
                        <span className="text-sm text-admin-muted">-</span>
                      )}
                    </TD>
                    <TD className="text-admin-muted">
                      {tEnum(dict, "maintenanceType", m.type)}
                    </TD>
                    <TD className="whitespace-nowrap text-admin-muted">
                      {formatDate(m.startAt, lang)} — {formatDate(m.endAt, lang)}
                    </TD>
                    <TD>
                      <Badge tone={maintenanceStatusTone(m.status)}>
                        {tEnum(dict, "maintenanceStatus", m.status)}
                      </Badge>
                    </TD>
                    <TD className="text-end whitespace-nowrap">
                      {formatCurrency(Number(m.cost), lang)}
                    </TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
