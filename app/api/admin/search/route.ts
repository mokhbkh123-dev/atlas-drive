import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { can } from "@/lib/access";
import { getSession } from "@/lib/auth";

type Item = { id: string; title: string; subtitle: string | null; href: string };
type Group = { group: string; items: Item[] };

const MAX_PER_GROUP = 5;

/**
 * GET /api/admin/search?q=...
 * Permission-aware global search across vehicles, reservations, customers,
 * invoices and payment references (spec §19).
 */
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ groups: [] });

  const like = { contains: q };
  const groups: Group[] = [];

  if (can(user.role, "fleet")) {
    const cars = await prisma.car.findMany({
      where: {
        OR: [{ brand: like }, { model: like }, { name: like }, { plateNumber: like }],
      },
      select: { id: true, name: true, plateNumber: true, status: true },
      take: MAX_PER_GROUP,
    });
    if (cars.length) {
      groups.push({
        group: "fleet",
        items: cars.map((c) => ({
          id: c.id,
          title: c.name,
          subtitle: c.plateNumber,
          href: `/admin/cars/${c.id}`,
        })),
      });
    }
  }

  if (can(user.role, "reservations")) {
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { publicRef: like },
          { customerName: like },
          { customerPhone: like },
          { customerEmail: like },
        ],
      },
      select: {
        id: true,
        publicRef: true,
        customerName: true,
        status: true,
        pickupAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: MAX_PER_GROUP,
    });
    if (bookings.length) {
      groups.push({
        group: "reservations",
        items: bookings.map((b) => ({
          id: b.id,
          title: b.publicRef,
          subtitle: `${b.customerName} — ${b.pickupAt.toISOString().slice(0, 10)}`,
          href: `/admin/bookings/${b.id}`,
        })),
      });
    }
  }

  if (can(user.role, "customers")) {
    const customers = await prisma.customer.findMany({
      where: {
        archivedAt: null,
        OR: [{ name: like }, { email: like }, { phone: like }],
      },
      select: { id: true, name: true, phone: true, email: true },
      take: MAX_PER_GROUP,
    });
    if (customers.length) {
      groups.push({
        group: "customers",
        items: customers.map((c) => ({
          id: c.id,
          title: c.name,
          subtitle: c.phone,
          href: `/admin/customers/${c.id}`,
        })),
      });
    }
  }

  if (can(user.role, "invoices")) {
    const invoices = await prisma.invoice.findMany({
      where: { OR: [{ number: like }] },
      select: {
        id: true,
        number: true,
        status: true,
        booking: { select: { publicRef: true, customerName: true } },
      },
      take: MAX_PER_GROUP,
    });
    if (invoices.length) {
      groups.push({
        group: "invoices",
        items: invoices.map((inv) => ({
          id: inv.id,
          title: inv.number,
          subtitle: `${inv.booking.publicRef} — ${inv.booking.customerName}`,
          href: `/admin/invoices/${inv.id}`,
        })),
      });
    }
  }

  if (can(user.role, "payments")) {
    const payments = await prisma.payment.findMany({
      where: { OR: [{ reference: like }] },
      select: {
        id: true,
        reference: true,
        amount: true,
        booking: { select: { publicRef: true } },
      },
      take: MAX_PER_GROUP,
    });
    if (payments.length) {
      groups.push({
        group: "payments",
        items: payments.map((p) => ({
          id: p.id,
          title: p.reference ?? p.booking.publicRef,
          subtitle: p.booking.publicRef,
          href: `/admin/payments`,
        })),
      });
    }
  }

  return NextResponse.json({ groups });
}
