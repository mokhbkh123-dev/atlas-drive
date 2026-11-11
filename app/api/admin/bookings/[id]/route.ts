import { NextRequest, NextResponse } from "next/server";
import type { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/rbac";
import { findPeriodConflict, RESERVED_BOOKING_STATUSES } from "@/lib/booking-availability";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await apiAuth("reservations");
  if (!auth.ok) return auth.response;
  try {
    const { id } = await params;
    const { status, cancellationReason } = await req.json();

    const validStatuses = ["PENDING", "CONFIRMED", "READY_FOR_PICKUP", "REJECTED", "CANCELLED", "IN_PROGRESS", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide", code: "INVALID_STATUS" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { car: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation introuvable", code: "BOOKING_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Confirming hands the vehicle to a customer, so the period must be free of
    // both other bookings and maintenance work.
    const confirming = status === "CONFIRMED" && booking.status !== "CONFIRMED";

    const updateData: Prisma.BookingUncheckedUpdateInput = { status: status as BookingStatus };
    if (confirming && !booking.confirmedById) {
      updateData.confirmedById = auth.user.id;
    }
    if (status === "IN_PROGRESS" && !booking.pickedUpAt) {
      updateData.pickedUpAt = new Date();
    }
    if (status === "COMPLETED" && !booking.returnedAt) {
      updateData.returnedAt = new Date();
    }
    if (status === "CANCELLED") {
      updateData.cancelledAt = new Date();
      if (cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (confirming) {
        const conflict = await findPeriodConflict(tx, {
          carId: booking.carId,
          pickupAt: booking.pickupAt,
          returnAt: booking.returnAt,
          bookingStatuses: RESERVED_BOOKING_STATUSES,
          ignoreBookingId: booking.id,
        });

        if (conflict) throw new Error(conflict);
      }

      return tx.booking.update({ where: { id }, data: updateData });
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "BOOKING_CONFLICT") {
      return NextResponse.json(
        { error: "Conflit de réservation - ce véhicule est déjà réservé sur cette période", code: "BOOKING_CONFLICT" },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === "MAINTENANCE_CONFLICT") {
      return NextResponse.json(
        { error: "Ce véhicule est en maintenance sur cette période", code: "MAINTENANCE_CONFLICT" },
        { status: 400 }
      );
    }
    console.error("Update booking error:", error);
    return NextResponse.json({ error: "Erreur serveur", code: "SERVER_ERROR" }, { status: 500 });
  }
}
