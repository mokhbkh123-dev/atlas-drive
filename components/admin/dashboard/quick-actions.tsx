import Link from "next/link";
import { CalendarPlus, Car, CarFront } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui";
import { getDict, type Locale } from "@/i18n";

type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
};

/** Only links to routes that are implemented in the admin panel. */
export default function DashboardQuickActions({ lang }: { lang: Locale }) {
  const t = getDict(lang).dashboard;
  const actions: QuickAction[] = [
    {
      label: t.quickActions.newReservation,
      href: `/${lang}/admin/bookings`,
      icon: CalendarPlus,
    },
    {
      label: t.quickActions.addVehicle,
      href: `/${lang}/admin/cars/new`,
      icon: CarFront,
    },
    {
      label: t.quickActions.fleet,
      href: `/${lang}/admin/cars`,
      icon: Car,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.quickActions.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href + action.label}
              href={action.href}
              className="group flex items-center gap-2.5 rounded-lg border border-admin-line bg-admin-surface px-3 py-2.5 transition-all hover:border-admin-navy/20 hover:bg-admin-bg/60 hover:shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8edf7] text-admin-navy transition-colors group-hover:bg-admin-navy group-hover:text-white">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 text-xs font-medium text-admin-ink">
                {action.label}
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
