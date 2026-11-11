import Link from "next/link";
import { UserPlus, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { getDict, resolveLocale } from "@/i18n";
import { formatDate } from "@/lib/utils";
import {
  buttonClass,
  EmptyState,
  PageHeader,
  Table,
  TD,
  TH,
  TR,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "customers");

  const t = getDict(lang).customers.list;

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      bookings: {
        select: { id: true, pickupAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    take: 200,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title={t.title}
        actions={
          <Link
            href={`/${lang}/admin/customers/new`}
            className={buttonClass("primary", "sm")}
          >
            <UserPlus className="h-3.5 w-3.5" aria-hidden />
            {t.new}
          </Link>
        }
      />

      {customers.length === 0 ? (
        <EmptyState icon={Users} title={t.empty} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-admin-line bg-admin-surface">
          <Table>
            <thead>
              <tr>
                <TH>{t.columns.name}</TH>
                <TH>{t.columns.phone}</TH>
                <TH className="hidden md:table-cell">{t.columns.email}</TH>
                <TH>{t.columns.lastBooking}</TH>
                <TH className="hidden sm:table-cell">{t.columns.added}</TH>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <TR key={c.id}>
                  <TD className="font-medium">{c.name}</TD>
                  <TD className="text-admin-muted whitespace-nowrap">
                    <a
                      href={`tel:${c.phone}`}
                      className="hover:text-admin-ink"
                      dir="ltr"
                    >
                      {c.phone}
                    </a>
                  </TD>
                  <TD className="hidden text-admin-muted md:table-cell">
                    {c.email || "—"}
                  </TD>
                  <TD className="text-admin-muted whitespace-nowrap">
                    {c.bookings[0] ? formatDate(c.bookings[0].pickupAt, lang) : "—"}
                  </TD>
                  <TD className="hidden text-admin-muted whitespace-nowrap sm:table-cell">
                    {formatDate(c.createdAt, lang)}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
