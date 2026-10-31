import { NextRequest, NextResponse } from "next/server";

import {
  parseCarPayload,
  prismaErrorCode,
} from "@/components/admin/fleet/car-schema";
import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/rbac";
import { slugify } from "@/lib/utils";

function validationError(message: string) {
  return NextResponse.json(
    { error: message, code: "VALIDATION" },
    { status: 400 }
  );
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || "vehicule";
  let slug = root;
  let counter = 2;
  while (
    await prisma.car.findUnique({ where: { slug }, select: { id: true } })
  ) {
    slug = `${root}-${counter}`;
    counter += 1;
  }
  return slug;
}

export async function POST(req: NextRequest) {
  const auth = await apiAuth("fleet");
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return validationError("Corps de requête invalide");
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

    const slug = await uniqueSlug(
      slugify(`${data.brand}-${data.model}-${data.name}`)
    );

    const car = await prisma.car.create({
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
        internalCode: (data as any).internalCode || null,
        internalNotes: (data as any).internalNotes || null,
        operationalStatus: (data as any).operationalStatus || "AVAILABLE",
        airConditioning: data.airConditioning,
        mileage: data.mileage,
        features: JSON.stringify(data.features),
        locationId: data.locationId,
        status: data.status,
        images:
          data.images.length > 0
            ? {
                create: data.images.map((image, index) => ({
                  url: image.url,
                  alt: image.alt,
                  sortOrder: index,
                  isPrimary: index === 0,
                })),
              }
            : undefined,
      },
    });

    await logActivity(auth.user, {
      action: "fleet.car.created",
      entityType: "Car",
      entityId: car.id,
      summary: `Véhicule créé : ${car.brand} ${car.model} (${car.name})${
        car.plateNumber ? ` — ${car.plateNumber}` : ""
      }`,
    });

    return NextResponse.json({ success: true, car }, { status: 201 });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      return NextResponse.json(
        {
          error: "Cette immatriculation est déjà utilisée",
          code: "PLATE_TAKEN",
        },
        { status: 409 }
      );
    }
    console.error("Create car error:", error);
    return NextResponse.json(
      { error: "Erreur serveur", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
