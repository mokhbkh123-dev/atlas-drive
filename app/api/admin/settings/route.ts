import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiAuth } from "@/lib/rbac";
import { SETTING_KEYS, type SettingKey } from "@/lib/settings";

/**
 * Rules per key. `parse` returns the value to store, or null when the input is
 * not acceptable; an empty value deletes the row so the site falls back to its
 * built-in default instead of showing a blank.
 */
const RULES: Record<SettingKey, { maxLength: number; parse: (raw: string) => string | null }> = {
  whatsapp_number: {
    maxLength: 32,
    parse: (raw) => {
      const trimmed = raw.trim();
      // Only a blank field means "reset"; "abcdef" must not slip through as one.
      if (!trimmed) return "";
      const digits = trimmed.replace(/[^0-9]/g, "");
      return digits.length >= 6 && digits.length <= 15 ? digits : null;
    },
  },
  contact_email: {
    maxLength: 160,
    parse: (raw) => {
      const value = raw.trim();
      if (!value) return "";
      return /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/.test(value) ? value.toLowerCase() : null;
    },
  },
  contact_address: {
    maxLength: 160,
    parse: (raw) => raw.trim() || "",
  },
  contact_hours: {
    maxLength: 160,
    parse: (raw) => raw.trim() || "",
  },
};

export async function PATCH(req: NextRequest) {
  const auth = await apiAuth("settings");
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corps JSON invalide", code: "REQUIRED_FIELDS" },
      { status: 400 }
    );
  }

  const incoming = (body as { settings?: Record<string, unknown> })?.settings;
  if (!incoming || typeof incoming !== "object") {
    return NextResponse.json(
      { error: "Aucun paramètre envoyé", code: "REQUIRED_FIELDS" },
      { status: 400 }
    );
  }

  const entries = Object.entries(incoming);
  if (entries.length === 0 || entries.length > SETTING_KEYS.length) {
    return NextResponse.json(
      { error: "Paramètres invalides", code: "MISSING_FIELDS" },
      { status: 400 }
    );
  }

  const clean: { key: SettingKey; value: string | null }[] = [];
  for (const [key, raw] of entries) {
    if (!SETTING_KEYS.includes(key as SettingKey)) {
      return NextResponse.json(
        { error: `Paramètre inconnu : ${key}`, code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }
    if (typeof raw !== "string") {
      return NextResponse.json(
        { error: `La valeur de ${key} doit être un texte`, code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }
    const rule = RULES[key as SettingKey];
    if (raw.length > rule.maxLength) {
      return NextResponse.json(
        { error: `${key} dépasse ${rule.maxLength} caractères`, code: "FIELD_TOO_LONG" },
        { status: 400 }
      );
    }
    const value = rule.parse(raw);
    if (value === null) {
      return NextResponse.json(
        { error: `Valeur invalide pour ${key}`, code: "INVALID_SETTING_VALUE" },
        { status: 400 }
      );
    }
    clean.push({ key: key as SettingKey, value: value || null });
  }

  try {
    await prisma.$transaction(
      clean.map(({ key, value }) =>
        value === null
          ? prisma.siteSetting.deleteMany({ where: { key } })
          : prisma.siteSetting.upsert({
              where: { key },
              create: { key, value },
              update: { value },
            })
      )
    );

    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: [...SETTING_KEYS] } },
    });
    return NextResponse.json({
      success: true,
      settings: Object.fromEntries(rows.map((row) => [row.key, row.value])),
    });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json(
      { error: "Erreur serveur", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
