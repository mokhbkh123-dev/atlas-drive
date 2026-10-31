import { NextRequest, NextResponse } from "next/server";

import { login } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { rateLimit, rateLimitReset } from "@/lib/ratelimit";

/**
 * POST /api/admin/auth/login { email, password }
 * Rate-limited per IP + email (10 attempts / 15 minutes).
 */
export async function POST(req: NextRequest) {
  try {
    let body: { email?: unknown; password?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Requête invalide", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants", code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const key = `login:${ip}:${email}`;
    const limit = rateLimit(key, 10, 15 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        {
          error: "Trop de tentatives",
          code: "RATE_LIMITED",
          retryAfterSec: limit.retryAfterSec,
        },
        { status: 429 }
      );
    }

    const user = await login(email, password, req.headers.get("user-agent"));
    if (!user) {
      return NextResponse.json(
        { error: "Identifiants invalides", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    rateLimitReset(key);
    await logActivity(user, {
      action: "auth.login",
      entityType: "User",
      entityId: user.id,
      summary: `${user.email} connected`,
    });

    return NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erreur serveur", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
