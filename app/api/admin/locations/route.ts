import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/rbac";

export async function GET() {
  try {
    const auth = await apiAuth("fleet");
    if (!auth.ok) return auth.response;

    const locations = await prisma.location.findMany({
      where: { isActive: true },
      select: { id: true, name: true, city: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ locations });
  } catch {
    return NextResponse.json(
      { error: "SERVER_ERROR", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
