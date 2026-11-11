import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRef } from "@/lib/booking-ref";
import { quoteRental, MIN_RENTAL_DAYS } from "@/lib/booking-pricing";
import { findPeriodConflict, RESERVED_BOOKING_STATUSES } from "@/lib/booking-availability";
import { rateLimit } from "@/lib/ratelimit";

/** Requests accepted per client IP before the route starts answering 429. */
const BOOKING_REQUESTS_PER_WINDOW = 5;
const BOOKING_WINDOW_MS = 15 * 60 * 1000;

/** Longest stored length per free-text field, counted after trimming. */
const FIELD_LIMITS: Record<string, number> = {
  customerName: 120,
  customerPhone: 32,
  customerEmail: 160,
  pickupLocation: 120,
  returnLocation: 120,
  customerNotes: 2000,
};

const asText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export async function POST(req: NextRequest) {
  try {
    // Counted before validation so rejected payloads can't be replayed for free.
    // Login's best-effort IP derivation, per instance. Skipped outside
    // production: with no proxy every dev request shares the "local" key.
    if (process.env.NODE_ENV === "production") {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
      const limit = rateLimit(`booking:${ip}`, BOOKING_REQUESTS_PER_WINDOW, BOOKING_WINDOW_MS);
      if (!limit.ok) {
        return NextResponse.json(
          {
            code: "RATE_LIMITED",
            error: "Trop de demandes envoyées. Veuillez réessayer plus tard.",
            retryAfterSec: limit.retryAfterSec,
          },
          {
            status: 429,
            headers: { "Retry-After": String(limit.retryAfterSec) },
          }
        );
      }
    }

    const parsed: unknown = await req.json().catch(() => null);
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json(
        {
          code: "REQUIRED_FIELDS",
          error: "Tous les champs obligatoires doivent être remplis",
        },
        { status: 400 }
      );
    }
    const body = parsed as Record<string, unknown>;

    const carId = asText(body.carId);
    const customerName = asText(body.customerName);
    const customerPhone = asText(body.customerPhone);
    const customerEmail = asText(body.customerEmail);
    const pickupAt = asText(body.pickupAt);
    const returnAt = asText(body.returnAt);
    const pickupLocation = asText(body.pickupLocation);
    const returnLocation = asText(body.returnLocation);
    const customerNotes = asText(body.customerNotes);

    if (!carId || !customerName || !customerPhone || !pickupAt || !returnAt || !pickupLocation || !returnLocation) {
      return NextResponse.json(
        {
          code: "REQUIRED_FIELDS",
          error: "Tous les champs obligatoires doivent être remplis",
        },
        { status: 400 }
      );
    }

    const oversized = Object.entries({
      customerName,
      customerPhone,
      customerEmail,
      pickupLocation,
      returnLocation,
      customerNotes,
    }).find(([field, value]) => value.length > FIELD_LIMITS[field]);

    if (oversized) {
      return NextResponse.json(
        {
          code: "FIELD_TOO_LONG",
          error: `Le champ ${oversized[0]} dépasse ${FIELD_LIMITS[oversized[0]]} caractères`,
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

    // The vehicle must be resolved before pricing: the agreed rate comes from
    // its own catalogue, never from anything the browser sends.
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car || car.status !== "PUBLISHED") {
      return NextResponse.json(
        { code: "CAR_UNAVAILABLE", error: "Véhicule non disponible" },
        { status: 400 }
      );
    }

    // Centralised duration rules (shared with the booking form).
    const rental = quoteRental(car, pickupAt, returnAt);
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

    // Check availability and reserve atomically: two concurrent requests for
    // the same vehicle must not both pass the overlap scan.
    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await findPeriodConflict(tx, {
        carId,
        pickupAt: pickup,
        returnAt: ret,
        bookingStatuses: RESERVED_BOOKING_STATUSES,
      });

      if (conflict) {
        throw new Error(conflict);
      }

      return tx.booking.create({
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
          dailyPriceSnapshot: rental.dailyPrice,
          extrasTotal: 0,
          deposit: rental.deposit,
          totalPrice: rental.total,
          status: "PENDING",
          customerNotes: customerNotes || null,
        },
      });
    });

    return NextResponse.json({ success: true, publicRef: booking.publicRef }, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);

    if (error instanceof Error && error.message === "BOOKING_CONFLICT") {
      return NextResponse.json(
        {
          code: "CAR_NOT_AVAILABLE_DATES",
          error: "Ce véhicule n'est pas disponible pour ces dates",
        },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === "MAINTENANCE_CONFLICT") {
      return NextResponse.json(
        {
          code: "CAR_IN_MAINTENANCE",
          error: "Ce véhicule est en maintenance pour ces dates",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { code: "SERVER_ERROR", error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
