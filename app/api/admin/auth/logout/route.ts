import { NextResponse } from "next/server";

import { destroySession, getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

/** POST /api/admin/auth/logout — revokes the current session. */
export async function POST() {
  try {
    const user = await getSession();
    await destroySession();
    if (user) {
      await logActivity(user, {
        action: "auth.logout",
        entityType: "User",
        entityId: user.id,
        summary: `${user.email} disconnected`,
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Erreur serveur", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
