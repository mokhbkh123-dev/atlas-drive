import { prisma } from "@/lib/prisma";

const SITE_SETTING_KEY = "whatsapp_number";

export async function getOwnerWhatsAppNumber(): Promise<string | null> {
  // Try environment variable first (public or server)
  const envValue = process.env.WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (envValue && envValue.trim()) {
    return normalizeNumber(envValue);
  }

  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: SITE_SETTING_KEY },
    });
    if (setting?.value && setting.value.trim()) {
      return normalizeNumber(setting.value);
    }
  } catch (error) {
    // Ignore DB errors and fall through
    console.error("Failed to read WhatsApp number from settings:", error);
  }

  return null;
}

export function normalizeNumber(number: string): string {
  // Remove all non-digit characters, keep only digits for wa.me
  return number.replace(/[^0-9]/g, "");
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizeNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}
