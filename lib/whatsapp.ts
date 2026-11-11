import { readSettings } from "@/lib/settings";

export async function getOwnerWhatsAppNumber(): Promise<string | null> {
  // A number the owner typed in /admin/settings wins over the environment:
  // otherwise saving there would silently change nothing.
  const stored = (await readSettings()).whatsapp_number;
  if (stored) return normalizeNumber(stored);

  const envValue = process.env.WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (envValue && envValue.trim()) {
    return normalizeNumber(envValue);
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
