import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRef } from "@/lib/utils";
import { calculateRental, MIN_RENTAL_DAYS } from "@/lib/booking-pricing";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      carId,
      customerName,
      customerPhone,
      customerEmail,
      pickupAt,
      returnAt,
      pickupLocation,
      returnLocation,
      customerNotes,
    } = body;

    if (!carId || !customerName || !customerPhone || !pickupAt || !returnAt || !pickupLocation || !returnLocation) {
      return NextResponse.json(
        {
          code: "REQUIRED_FIELDS",
          error: "Tous les champs obligatoires doivent être remplis",
        },
        { status: 400 }
      );
    }

    const pickup = new Date(pickupAt);
    const ret = new Date(returnAt);

    if (Number.isNaN(pickup.getTime()) || Number.isNaN(ret.getTime()) || ret <= pickup) {
      return NextResponse.json(
        {
          code: "INVALID_DATES",
          error: "La date de retour doit être postérieure à la date de prise en charge",
        },
        { status: 400 }
      );
    }

    // Centralised pricing/duration rules (shared with the booking form).
    // The client can never bypass these checks by sending its own total.
    const rental = calculateRental(pickupAt, returnAt);
    if (!rental.meetsMinimum) {
      return NextResponse.json(
        {
          code: "MIN_RENTAL_DAYS",
          error: `La durée minimale de location est de ${MIN_RENTAL_DAYS} jours`,
          minDays: MIN_RENTAL_DAYS,
          days: rental.days,
        },
        { status: 400 }
      );
    }

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car || car.status !== "PUBLISHED") {
      return NextResponse.json(
        { code: "CAR_UNAVAILABLE", error: "Véhicule non disponible" },
        { status: 400 }
      );
    }

    // Check availability - confirmed/in_progress block
    const overlapping = await prisma.booking.findFirst({
      where: {
        carId,
        status: { in: ["CONFIRMED", "IN_PROGRESS"] },
        OR: [
          {
            pickupAt: { lte: ret },
            returnAt: { gt: pickup },
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        {
          code: "CAR_NOT_AVAILABLE_DATES",
          error: "Ce véhicule n'est pas disponible pour ces dates",
        },
        { status: 400 }
      );
    }

    // Calculate price from the shared business rules:
    // calendar-day duration × requested daily price (250 MAD).
    const { dailyPrice, total } = rental;

    const booking = await prisma.booking.create({
      data: {
        publicRef: generateRef("AD"),
        carId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        pickupAt: pickup,
        returnAt: ret,
        pickupLocation,
        returnLocation,
        dailyPriceSnapshot: dailyPrice,
        extrasTotal: 0,
        totalPrice: total,
        status: "PENDING",
        customerNotes: customerNotes || null,
      },
    });

    return NextResponse.json({ success: true, publicRef: booking.publicRef }, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
