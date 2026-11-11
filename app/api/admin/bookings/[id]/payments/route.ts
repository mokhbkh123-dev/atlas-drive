import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/rbac";

const METHODS = ["CASH", "BANK_TRANSFER", "CARD", "CHECK", "OTHER"];
/** Bookings that will never be paid: they produced no service. */
const CLOSED_STATUSES = ["REJECTED", "CANCELLED"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await apiAuth("payments");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corps JSON invalide", code: "REQUIRED_FIELDS" },
      { status: 400 }
    );
  }

  const input = body as {
    amount?: unknown;
    method?: unknown;
    paidAt?: unknown;
    reference?: unknown;
  };

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Montant invalide", code: "INVALID_AMOUNT" },
      { status: 400 }
    );
  }
  if (Math.round(amount * 100) / 100 !== amount) {
    return NextResponse.json(
      { error: "Le montant est limité à 2 décimales", code: "INVALID_AMOUNT" },
      { status: 400 }
    );
  }

  const method = typeof input.method === "string" ? input.method : "";
  if (!METHODS.includes(method)) {
    return NextResponse.json(
      { error: "Mode de paiement invalide", code: "INVALID_PAYMENT_METHOD" },
      { status: 400 }
    );
  }

  const paidAt = input.paidAt ? new Date(String(input.paidAt)) : new Date();
  if (Number.isNaN(paidAt.getTime())) {
    return NextResponse.json(
      { error: "Date invalide", code: "INVALID_DATES" },
      { status: 400 }
    );
  }
  if (paidAt.getTime() > Date.now() + 86_400_000) {
    return NextResponse.json(
      { error: "Impossible d'encaisser une date future", code: "FUTURE_PAYMENT_DATE" },
      { status: 400 }
    );
  }

  const reference =
    typeof input.reference === "string" ? input.reference.trim().slice(0, 60) : "";

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true, status: true, totalPrice: true },
    });
    if (!booking) {
      return NextResponse.json(
        { error: "Réservation introuvable", code: "BOOKING_NOT_FOUND" },
        { status: 404 }
      );
    }
    if (CLOSED_STATUSES.includes(booking.status)) {
      return NextResponse.json(
        { error: "Réservation annulée", code: "PAYMENT_NOT_ALLOWED" },
        { status: 400 }
      );
    }

    const already = await prisma.payment.aggregate({
      where: { bookingId: id, status: "PAID" },
      _sum: { amount: true },
    });
    const remaining = Number(booking.totalPrice) - Number(already._sum.amount ?? 0);
    if (amount > remaining + 0.001) {
      return NextResponse.json(
        {
          error: `Le paiement dépasse le reste dû (${remaining.toFixed(2)} MAD)`,
          code: "AMOUNT_EXCEEDS_REMAINING",
        },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId: id,
        amount,
        method,
        status: "PAID",
        paidAt,
        reference: reference || null,
        createdById: auth.user.id,
      },
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error) {
    console.error("Record payment error:", error);
    return NextResponse.json(
      { error: "Erreur serveur", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
