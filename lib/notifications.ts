import { prisma } from "@/lib/prisma";

export type NotifyInput = {
  /** Stable type key, translated client-side via dict.notifications.types.* */
  type: string;
  /** JSON-safe payload used to render the translated title (refs, names…). */
  params?: Record<string, string | number | null>;
  /** Locale-prefixed admin path, e.g. "/fr/admin/bookings/abc". */
  link?: string;
  /** Unique per event — prevents duplicates (spec §16). */
  dedupeKey?: string;
};

/**
 * Create an in-app notification. Never throws; duplicates are ignored.
 */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    const data = {
      type: input.type,
      params: input.params ? JSON.stringify(input.params) : null,
      link: input.link ?? null,
      dedupeKey: input.dedupeKey ?? null,
    };
    if (input.dedupeKey) {
      await prisma.notification.upsert({
        where: { dedupeKey: input.dedupeKey },
        create: data,
        update: {},
      });
    } else {
      await prisma.notification.create({ data });
    }
  } catch (error) {
    console.error("notify failed:", error);
  }
}

export async function markNotificationsRead(ids?: string[]): Promise<void> {
  await prisma.notification.updateMany({
    where: ids && ids.length > 0 ? { id: { in: ids }, readAt: null } : { readAt: null },
    data: { readAt: new Date() },
  });
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Lazily generate recurring operational reminders (upcoming pickups/returns,
 * overdue vehicles, maintenance due today, bookings awaiting confirmation).
 * Called on admin layout load — no cron required; dedupe keys make it idempotent.
 */
export async function ensureDailyNotifications(): Promise<void> {
  const now = new Date();
  const today = dayKey(now);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  try {
    // Upcoming pickups today (confirmed, not yet picked up).
    const pickups = await prisma.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "READY_FOR_PICKUP"] },
        pickedUpAt: null,
        pickupAt: { gte: now, lte: endOfToday },
      },
      select: { id: true, publicRef: true },
    });
    for (const b of pickups) {
      await notify({
        type: "pickup_today",
        params: { ref: b.publicRef },
        link: `/admin/bookings/${b.id}`,
        dedupeKey: `pickup:${b.id}:${today}`,
      });
    }

    // Returns due today.
    const returns = await prisma.booking.findMany({
      where: {
        status: "IN_PROGRESS",
        returnedAt: null,
        returnAt: { gte: now, lte: endOfToday },
      },
      select: { id: true, publicRef: true },
    });
    for (const b of returns) {
      await notify({
        type: "return_today",
        params: { ref: b.publicRef },
        link: `/admin/bookings/${b.id}`,
        dedupeKey: `return:${b.id}:${today}`,
      });
    }

    // Overdue returns.
    const overdue = await prisma.booking.findMany({
      where: { status: "IN_PROGRESS", returnedAt: null, returnAt: { lt: now } },
      select: { id: true, publicRef: true },
    });
    for (const b of overdue) {
      await notify({
        type: "overdue",
        params: { ref: b.publicRef },
        link: `/admin/bookings/${b.id}`,
        dedupeKey: `overdue:${b.id}:${today}`,
      });
    }

    // Maintenance starting today.
    const maint = await prisma.maintenance.findMany({
      where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] }, startAt: { lte: endOfToday } },
      select: { id: true, car: { select: { name: true } } },
      take: 50,
    });
    for (const m of maint) {
      await notify({
        type: "maintenance_today",
        params: { car: m.car.name },
        link: `/admin/maintenance`,
        dedupeKey: `maint:${m.id}:${today}`,
      });
    }

    // Bookings waiting for confirmation (one per booking, ever).
    const pending = await prisma.booking.findMany({
      where: { status: "PENDING" },
      select: { id: true, publicRef: true },
      take: 50,
    });
    for (const b of pending) {
      await notify({
        type: "pending_confirmation",
        params: { ref: b.publicRef },
        link: `/admin/bookings/${b.id}`,
        dedupeKey: `pending:${b.id}`,
      });
    }
  } catch (error) {
    console.error("ensureDailyNotifications failed:", error);
  }
}
