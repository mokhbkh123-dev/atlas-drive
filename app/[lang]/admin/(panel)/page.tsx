import { Suspense } from "react";
import Link from "next/link";
import {
  Car,
  CalendarDays,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/rbac";
import { formatCurrency } from "@/lib/utils";
import { getDict, resolveLocale, tEnum } from "@/i18n";
import AtlasDashboard from "@/components/admin/dashboard/atlas-dashboard";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireModule(lang, "dashboard");

  const [totalCars, totalBookings, totalCustomers, recentBookings, allBookings] = await Promise.all([
    prisma.car.count(),
    prisma.booking.count(),
    prisma.customer.count(),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { car: true },
    }),
    prisma.booking.findMany({
      select: { status: true, totalPrice: true, createdAt: true },
    }),
  ]);

  // Calculate revenue
  const confirmedStatuses = ["CONFIRMED", "READY_FOR_PICKUP", "IN_PROGRESS", "COMPLETED"];
  const revenue = allBookings
    .filter((b) => confirmedStatuses.includes(b.status))
    .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);

  // Status counts
  const statusCounts = {
    CONFIRMED: allBookings.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED" || b.status === "IN_PROGRESS" || b.status === "READY_FOR_PICKUP").length,
    PENDING: allBookings.filter((b) => b.status === "PENDING").length,
    CANCELLED: allBookings.filter((b) => b.status === "CANCELLED" || b.status === "REJECTED").length,
  };

  return (
    <AtlasDashboard
      lang={lang}
      stats={{
        totalCars,
        totalBookings,
        revenue,
        totalCustomers,
      }}
      statusCounts={statusCounts}
      recentBookings={recentBookings.map((b) => ({
        id: b.id,
        customerName: b.customerName,
        carName: b.car ? (b.car.name || `${b.car.brand} ${b.car.model}`) : "-",
        pickupAt: b.pickupAt,
        returnAt: b.returnAt,
        status: b.status,
        totalPrice: Number(b.totalPrice),
        publicRef: b.publicRef,
      }))}
    />
  );
}
