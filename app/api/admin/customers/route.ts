import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/rbac";
import { logActivity } from "@/lib/activity";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Staff-facing directory; used by the customer list and the create form. */
export async function GET(req: NextRequest) {
  const auth = await apiAuth("customers");
  if (!auth.ok) return auth.response;

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { phone: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ success: true, customers });
}

export async function POST(req: NextRequest) {
  const auth = await apiAuth("customers");
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const name = clean(body.name);
    const phone = clean(body.phone);
    const email = clean(body.email).toLowerCase();
    const licenseNumber = clean(body.licenseNumber);
    const notes = clean(body.notes);

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Le nom et le téléphone sont obligatoires" },
        { status: 400 }
      );
    }
    if (name.length > 120) {
      return NextResponse.json(
        { success: false, error: "Le nom ne peut pas dépasser 120 caractères" },
        { status: 400 }
      );
    }
    if (phone.replace(/\D/g, "").length < 6) {
      return NextResponse.json(
        { success: false, error: "Numéro de téléphone invalide" },
        { status: 400 }
      );
    }
    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: "Adresse email invalide" },
        { status: 400 }
      );
    }
    if (licenseNumber.length > 50) {
      return NextResponse.json(
        { success: false, error: "Le numéro de permis est trop long" },
        { status: 400 }
      );
    }
    if (notes.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Les notes ne peuvent pas dépasser 2000 caractères" },
        { status: 400 }
      );
    }

    // A phone number identifies a customer in this CRM; avoid duplicate files.
    const existing = await prisma.customer.findFirst({
      where: { phone, archivedAt: null },
      select: { id: true, name: true },
    });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          code: "CUSTOMER_EXISTS",
          error: `Un client avec ce téléphone existe déjà : ${existing.name}`,
          customerId: existing.id,
        },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email || null,
        licenseNumber: licenseNumber || null,
        notes: notes || null,
      },
    });

    await logActivity(auth.user, {
      action: "customer.created",
      entityType: "Customer",
      entityId: customer.id,
      summary: `Client créé : ${customer.name} (${customer.phone})`,
      after: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        licenseNumber: customer.licenseNumber,
      },
    });

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error) {
    console.error("Create customer error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
