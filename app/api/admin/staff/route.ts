import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import { can } from "@/lib/access";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_MAX = 80;
const EMAIL_MAX = 120;

const fail = (code: string, status = 400) =>
  NextResponse.json({ success: false, error: code, code }, { status });

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return fail("UNAUTHORIZED", 401);
    }
    if (!can(session.role, "staff")) {
      return fail("FORBIDDEN", 403);
    }

    const body = await req.json();
    const { name, email, password, role, isActive } = body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedName = typeof name === "string" ? name.trim() : "";

    if (!trimmedName || !normalizedEmail || !password) {
      return fail("MISSING_FIELDS");
    }
    if (trimmedName.length > NAME_MAX || normalizedEmail.length > EMAIL_MAX) {
      return fail("NAME_TOO_LONG");
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return fail("INVALID_EMAIL");
    }
    if (typeof password !== "string" || password.length < 8) {
      return fail("PASSWORD_TOO_SHORT");
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return fail("EMAIL_TAKEN");
    }

    const allowedRoles: UserRole[] = ["AGENT", "MANAGER", "FLEET_MANAGER", "FINANCE", "SUPER_ADMIN"];
    const userRole: UserRole = allowedRoles.includes(role) ? role : "AGENT";

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        role: userRole,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error: any) {
    console.error("Create staff error:", error);
    return fail("SERVER_ERROR", 500);
  }
}
