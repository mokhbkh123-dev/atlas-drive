import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/rbac";
import { validateLocation } from "@/lib/locations";

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

export async function POST(req: NextRequest) {
  const auth = await apiAuth("locations");
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Corps JSON invalide", code: "REQUIRED_FIELDS" },
      { status: 400 }
    );
  }

  const input = validateLocation(body, { partial: false });
  if (!input.ok) {
    return NextResponse.json({ error: "Champs invalides", code: input.code }, { status: 400 });
  }

  try {
    // Only one agency can hold the primary flag.
    if (input.data.isPrimary) {
      await prisma.location.updateMany({ where: {}, data: { isPrimary: false } });
    }

    const location = await prisma.location.create({
      data: {
        name: input.data.name,
        city: input.data.city,
        address: input.data.address,
        phone: input.data.phone,
        email: input.data.email,
        isActive: input.data.isActive,
        isPrimary: input.data.isPrimary,
      },
    });

    return NextResponse.json({ success: true, location }, { status: 201 });
  } catch (error) {
    console.error("Create location error:", error);
    return NextResponse.json(
      { error: "Erreur serveur", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

