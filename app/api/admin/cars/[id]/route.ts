import { NextRequest, NextResponse } from "next/server";

import {
  CAR_STATUSES,
  parseCarPayload,
  prismaErrorCode,
  type CarStatusValue,
} from "@/components/admin/fleet/car-schema";
import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/rbac";
import { slugify } from "@/lib/utils";

const BLOCKING_BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "IN_PROGRESS",
] as const;

const CAR_SELECT = {
  id: true,
  brand: true,
  model: true,
  name: true,
  plateNumber: true,
} as const;

function validationError(message: string) {
  return NextResponse.json(
    { error: message, code: "VALIDATION" },
    { status: 400 }
  );
}

function notFoundError() {
  return NextResponse.json(
    { error: "Véhicule introuvable", code: "NOT_FOUND" },
    { status: 404 }
  );
}

function plateTakenError() {
  return NextResponse.json(
    {
      error: "Cette immatriculation est déjà utilisée",
      code: "PLATE_TAKEN",
    },
    { status: 409 }
  );
}

async function uniqueSlug(base: string, excludeId: string): Promise<string> {
  const root = base || "vehicule";
  let slug = root;
  let counter = 2;
  while (
    await prisma.car.findFirst({
      where: { slug, id: { not: excludeId } },
      select: { id: true },
    })
  ) {
    slug = `${root}-${counter}`;
    counter += 1;
  }
  return slug;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await apiAuth("fleet");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return validationError("Corps de requête invalide");
  }

  const existing = await prisma.car.findUnique({
    where: { id },
    select: {
      ...CAR_SELECT,
      slug: true,
      status: true,
    },
  });
  if (!existing) return notFoundError();

  const isRecord =
    typeof body === "object" && body !== null && !Array.isArray(body);
  const record = isRecord ? (body as Record<string, unknown>) : {};
  const statusOnly =
    typeof record.status === "string" && record.brand === undefined;

  // Archive / unarchive: only the status is sent by the detail page.
  if (statusOnly) {
    const status = record.status as string;
    if (!(CAR_STATUSES as readonly string[]).includes(status)) {
      return validationError("Statut invalide");
    }
    try {
      const car = await prisma.car.update({
        where: { id },
        data: { status: status as CarStatusValue },
      });
      await logActivity(auth.user, {
        action: "fleet.car.updated",
        entityType: "Car",
        entityId: car.id,
        summary: `Statut du véhicule ${car.brand} ${car.model} (${car.name}) : ${status}`,
      });
      return NextResponse.json({ success: true, car });
    } catch (error) {
      console.error("Update car status error:", error);
      return NextResponse.json(
        { error: "Erreur serveur", code: "SERVER_ERROR" },
        { status: 500 }
      );
    }
  }

  const parsed = parseCarPayload(body);
  if (!parsed.ok) return validationError(parsed.message);
  const data = parsed.value;

  try {
    if (data.locationId) {
      const location = await prisma.location.findUnique({
        where: { id: data.locationId },
        select: { id: true },
      });
      if (!location) {
        return validationError("Agence introuvable");
      }
    }

    const slug =
      data.name !== existing.name
        ? await uniqueSlug(
            slugify(`${data.brand}-${data.model}-${data.name}`),
            id
          )
        : existing.slug;

    const car = await prisma.$transaction(async (tx) => {
      const updated = await tx.car.update({
        where: { id },
        data: {
          slug,
          brand: data.brand,
          model: data.model,
          name: data.name,
          year: data.year,
          category: data.category,
          transmission: data.transmission,
          fuelType: data.fuelType,
          seats: data.seats,
          doors: data.doors,
          dailyPrice: data.dailyPrice,
          weeklyPrice: data.weeklyPrice,
          monthlyPrice: data.monthlyPrice,
          deposit: data.deposit,
          description: data.description,
          plateNumber: data.plateNumber,
          vin: data.vin,
          airConditioning: data.airConditioning,
          mileage: data.mileage,
          features: JSON.stringify(data.features),
          locationId: data.locationId,
          status: data.status,
        },
      });

      await tx.carImage.deleteMany({ where: { carId: id } });
      if (data.images.length > 0) {
        await tx.carImage.createMany({
          data: data.images.map((image, index) => ({
            carId: id,
            url: image.url,
            alt: image.alt,
            sortOrder: index,
            isPrimary: index === 0,
          })),
        });
      }

      return updated;
    });

    await logActivity(auth.user, {
      action: "fleet.car.updated",
      entityType: "Car",
      entityId: car.id,
      summary: `Véhicule mis à jour : ${car.brand} ${car.model} (${car.name})${
        car.plateNumber ? ` — ${car.plateNumber}` : ""
      }`,
    });

    return NextResponse.json({ success: true, car });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      return plateTakenError();
    }
    console.error("Update car error:", error);
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
  const auth = await apiAuth("fleet");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const car = await prisma.car.findUnique({
    where: { id },
    select: CAR_SELECT,
  });
  if (!car) return notFoundError();

  const activeBookings = await prisma.booking.count({
    where: {
      carId: id,
      status: { in: [...BLOCKING_BOOKING_STATUSES] },
    },
  });

  if (activeBookings > 0) {
    return NextResponse.json(
      {
        error:
          "Ce véhicule a des réservations actives et ne peut pas être supprimé",
        code: "CAR_HAS_BOOKINGS",
      },
      { status: 409 }
    );
  }

  try {
    await prisma.car.delete({ where: { id } });

    await logActivity(auth.user, {
      action: "fleet.car.deleted",
      entityType: "Car",
      entityId: id,
      summary: `Véhicule supprimé : ${car.brand} ${car.model} (${car.name})${
        car.plateNumber ? ` — ${car.plateNumber}` : ""
      }`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Historic bookings use onDelete: Restrict in the schema.
    if (prismaErrorCode(error) === "P2003") {
      return NextResponse.json(
        {
          error: "Ce véhicule a des réservations et ne peut pas être supprimé",
          code: "CAR_HAS_BOOKINGS",
        },
        { status: 409 }
      );
    }
    console.error("Delete car error:", error);
    return NextResponse.json(
      { error: "Erreur serveur", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
