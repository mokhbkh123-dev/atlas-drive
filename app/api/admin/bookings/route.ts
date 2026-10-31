import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/rbac";
import { generateRef } from "@/lib/utils";
import { calculateRental, MIN_RENTAL_DAYS } from "@/lib/booking-pricing";
import type { BookingSource, BookingStatus } from "@prisma/client";

const BLOCKING_STATUSES = ["PENDING", "CONFIRMED", "READY_FOR_PICKUP", "IN_PROGRESS"];

export async function POST(req: NextRequest) {
  const auth = await apiAuth("reservations");
  if (!auth.ok) return auth.response;

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
      internalNotes,
      source = "WALK_IN",
      status = "CONFIRMED",
      dailyPrice,
      discount = 0,
      deposit = 0,
      extrasTotal = 0,
      paymentAmount,
      paymentMethod = "CASH",
      paymentReference,
    } = body;

    if (!carId || !customerName || !customerPhone || !pickupAt || !returnAt || !pickupLocation || !returnLocation) {
      return NextResponse.json(
        { code: "REQUIRED_FIELDS", error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    const pickup = new Date(pickupAt);
    const ret = new Date(returnAt);

    if (Number.isNaN(pickup.getTime()) || Number.isNaN(ret.getTime()) || ret <= pickup) {
      return NextResponse.json(
        { code: "INVALID_DATES", error: "La date de retour doit être postérieure à la date de prise en charge" },
        { status: 400 }
      );
    }

    const rental = calculateRental(pickupAt, returnAt);
    if (!rental.meetsMinimum) {
      return NextResponse.json(
        { code: "MIN_RENTAL_DAYS", error: `La durée minimale de location est de ${MIN_RENTAL_DAYS} jours`, minDays: MIN_RENTAL_DAYS, days: rental.days },
        { status: 400 }
      );
    }

    const validSources: BookingSource[] = ["ADMIN", "PHONE", "WALK_IN"];
    const validStatuses: BookingStatus[] = ["PENDING", "CONFIRMED", "READY_FOR_PICKUP"];
    if (!validSources.includes(source)) {
      return NextResponse.json({ code: "INVALID_SOURCE", error: "Source invalide" }, { status: 400 });
    }
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ code: "INVALID_STATUS", error: "Statut invalide" }, { status: 400 });
    }

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) {
      return NextResponse.json({ code: "CAR_NOT_FOUND", error: "Véhicule introuvable" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const carRecord = await tx.car.findUnique({
        where: { id: carId },
        select: { operationalStatus: true, status: true, dailyPrice: true },
      });
      if (!carRecord) {
        throw new Error("CAR_NOT_FOUND");
      }
      if ((carRecord as any).operationalStatus === "MAINTENANCE" || carRecord.status === "ARCHIVED") {
        throw new Error("VEHICLE_UNAVAILABLE");
      }

      const overlapping = await tx.booking.findFirst({
        where: {
          carId,
          status: { in: BLOCKING_STATUSES as any },
          OR: [{ pickupAt: { lte: ret }, returnAt: { gt: pickup } }],
        },
      });

      if (overlapping) {
        throw new Error("BOOKING_CONFLICT");
      }

      const daily = dailyPrice !== undefined && dailyPrice !== null ? Number(dailyPrice) : Number((carRecord as any).dailyPrice);
      const extras = Number(extrasTotal || 0);
      const disc = Number(discount || 0);
      const dep = Number(deposit || 0);
      const total = Math.max(0, daily * rental.days + extras - disc);

      const booking = await tx.booking.create({
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
          dailyPriceSnapshot: daily,
          extrasTotal: extras,
          discount: disc,
          deposit: dep,
          totalPrice: total,
          status,
          source,
          customerNotes: customerNotes || null,
          internalNotes: internalNotes || null,
          confirmedById: status === "CONFIRMED" ? auth.user.id : null,
        },
      });

      if (paymentAmount !== undefined && paymentAmount !== null && Number(paymentAmount) > 0) {
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount: Number(paymentAmount),
            method: paymentMethod || "CASH",
            status: "PAID",
            reference: paymentReference || null,
            paidAt: new Date(),
            createdById: auth.user.id,
          },
        });
      }

      return booking;
    });

    const booking = await prisma.booking.findUnique({ where: { id: result.id }, include: { car: true, customer: true, payments: true } });
    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error: any) {
    if (error?.message === "BOOKING_CONFLICT") {
      return NextResponse.json({ code: "BOOKING_CONFLICT", error: "Conflit de réservation - ce véhicule est déjà réservé sur cette période" }, { status: 400 });
    }
    if (error?.message === "VEHICLE_UNAVAILABLE") {
      return NextResponse.json({ code: "VEHICLE_UNAVAILABLE", error: "Véhicule indisponible (en maintenance ou archivé)" }, { status: 400 });
    }
    if (error?.message === "CAR_NOT_FOUND") {
      return NextResponse.json({ code: "CAR_NOT_FOUND", error: "Véhicule introuvable" }, { status: 400 });
    }
    console.error("Admin create booking error:", error);
    return NextResponse.json({ code: "SERVER_ERROR", error: "Erreur serveur" }, { status: 500 });
  }
}
