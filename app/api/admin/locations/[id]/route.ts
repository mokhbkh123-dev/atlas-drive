import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/rbac";
import { validateLocation } from "@/lib/locations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await apiAuth("locations");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Corps JSON invalide", code: "REQUIRED_FIELDS" },
      { status: 400 }
    );
  }

  const input = validateLocation(body, { partial: true });
  if (!input.ok) {
    return NextResponse.json({ error: "Champs invalides", code: input.code }, { status: 400 });
  }

  try {
    const existing = await prisma.location.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Agence introuvable", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (input.data.isPrimary) {
      await prisma.location.updateMany({
        where: { id: { not: id } },
        data: { isPrimary: false },
      });
    }

    const location = await prisma.location.update({ where: { id }, data: input.data });

    return NextResponse.json({ success: true, location });
  } catch (error) {
    console.error("Update location error:", error);
    return NextResponse.json(
      { error: "Erreur serveur", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await apiAuth("locations");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const existing = await prisma.location.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Agence introuvable", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Car.locationId is `onDelete: SetNull`, so attached vehicles stay in the
    // fleet and simply lose their agency.
    await prisma.location.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete location error:", error);
    return NextResponse.json(
      { error: "Erreur serveur", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
