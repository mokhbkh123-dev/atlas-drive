import { prisma } from "@/lib/prisma";

/**
 * Keys the owner can set from `/admin/settings`.
 *
 * Every one of them is read back by a public page, so the form never offers a
 * field that changes nothing. `lib/whatsapp.ts`, the footer and the contact
 * page all resolve through this list.
 */
export const SETTING_KEYS = [
  "whatsapp_number",
  "contact_email",
  "contact_address",
  "contact_hours",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export type StoredSettings = Partial<Record<SettingKey, string>>;

/** Stored values only; blanks and read failures resolve to "nothing configured". */
export async function readSettings(): Promise<StoredSettings> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: [...SETTING_KEYS] } },
    });
    const stored: StoredSettings = {};
    for (const row of rows) {
      const value = row.value.trim();
      if (value) stored[row.key as SettingKey] = value;
    }
    return stored;
  } catch (error) {
    console.error("Failed to read site settings:", error);
    return {};
  }
}

/** What the owner stored, or the built-in default when they never touched it. */
export function settingOr(
  stored: StoredSettings,
  key: SettingKey,
  fallback: string
): string {
  return stored[key] ?? fallback;
}
