import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/rbac";

const BLOCKING_STATUSES = ["PENDING", "CONFIRMED", "READY_FOR_PICKUP", "IN_PROGRESS"];

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

    // If confirming, check for overlaps against blocking statuses
    if (status === "CONFIRMED" && booking.status !== "CONFIRMED") {
      const overlapping = await prisma.booking.findFirst({
        where: {
          carId: booking.carId,
          id: { not: booking.id },
          status: { in: BLOCKING_STATUSES as any },
          OR: [
            {
              pickupAt: { lte: booking.returnAt },
              returnAt: { gt: booking.pickupAt },
            },
          ],
        },
      });

      if (overlapping) {
        return NextResponse.json(
          { error: "Conflit de réservation - ce véhicule est déjà réservé sur cette période", code: "BOOKING_CONFLICT" },
          { status: 400 }
        );
      }
    }

    const updateData: any = { status };
    if (status === "CONFIRMED" && booking.status !== "CONFIRMED" && !booking.confirmedById) {
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

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json({ error: "Erreur serveur", code: "SERVER_ERROR" }, { status: 500 });
  }
}
