import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import { can } from "@/lib/access";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!can(session.role, "staff")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role, isActive } = body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!name || !normalizedEmail || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 });
    }

    const allowedRoles: UserRole[] = ["AGENT", "MANAGER", "FLEET_MANAGER", "FINANCE", "SUPER_ADMIN"];
    const userRole: UserRole = allowedRoles.includes(role) ? role : "AGENT";

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        role: userRole,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error: any) {
    console.error("Create staff error:", error);
    return NextResponse.json({ success: false, error: error.message || "Error" }, { status: 500 });
  }
}
