import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/rbac";

export async function GET() {
  const auth = await apiAuth("maintenance");
  if (!auth.ok) return auth.response;

  try {
    const maintenances = await prisma.maintenance.findMany({
      orderBy: [{ status: "asc" }, { startAt: "asc" }],
      include: {
        car: {
          select: { id: true, name: true, brand: true, model: true, plateNumber: true, operationalStatus: true },
        },
      },
    });
    return NextResponse.json({ success: true, maintenances }, { status: 200 });
  } catch (error) {
    console.error("Get maintenance error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await apiAuth("maintenance");
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { carId, type, startAt, endAt, nextServiceAt, mileage, cost, provider, description, notes, status } = body;

    if (!carId || !startAt || !endAt) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) {
      return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        carId,
        type: type || "OTHER",
        status: status || "SCHEDULED",
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        nextServiceAt: nextServiceAt ? new Date(nextServiceAt) : null,
        mileage: mileage ? Number(mileage) : null,
        cost: cost ?? 0,
        provider: provider?.trim() || null,
        description: description?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    if (status === "IN_PROGRESS" || status === "SCHEDULED") {
      await prisma.car.update({
        where: { id: carId },
        data: { operationalStatus: "MAINTENANCE" },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, maintenance }, { status: 201 });
  } catch (error) {
    console.error("Create maintenance error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
