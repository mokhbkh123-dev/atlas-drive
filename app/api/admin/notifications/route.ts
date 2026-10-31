import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { markNotificationsRead } from "@/lib/notifications";
import { apiAuth } from "@/lib/rbac";

/** GET /api/admin/notifications?limit=8 — recent notifications + unread count. */
export async function GET(req: NextRequest) {
  const auth = await apiAuth("notifications");
  if (!auth.ok) return auth.response;

  const limit = Math.min(
    50,
    Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 15) || 15)
  );

  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({ where: { readAt: null } }),
  ]);

  return NextResponse.json({ notifications, unread });
}

/** POST /api/admin/notifications — mark all (or given ids) as read. */
export async function POST(req: NextRequest) {
  const auth = await apiAuth("notifications");
  if (!auth.ok) return auth.response;

  let ids: string[] | undefined;
  try {
    const body = await req.json();
    if (Array.isArray(body?.ids)) ids = body.ids.filter((v: unknown) => typeof v === "string");
  } catch {
    // Empty body → mark everything read.
  }

  await markNotificationsRead(ids);
  return NextResponse.json({ success: true });
}
