import type { Dictionary } from "@/i18n";
import type { BadgeTone } from "@/components/admin/ui";

import type { FleetAvailability } from "./types";

/** Parse the JSON array stored in `Car.features`, tolerating legacy data. */
export function parseFeatures(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  } catch {
    // Legacy comma-separated value.
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

/** Look up an API error code in the fleet dictionary. */
export function fleetError(
  dict: Dictionary,
  code: string | null | undefined,
  fallback?: string | null
): string {
  if (code) {
    const messages = dict.fleet.errors as Record<string, string | undefined>;
    const translated = messages[code];
    if (translated) return translated;
  }
  return fallback || dict.fleet.errors.GENERIC;
}

export function availabilityTone(
  availability: FleetAvailability
): BadgeTone {
  if (availability === "rented") return "accent";
  if (availability === "maintenance") return "warning";
  return "success";
}

export function carStatusTone(status: string): BadgeTone {
  if (status === "PUBLISHED") return "success";
  if (status === "ARCHIVED") return "neutral";
  return "info";
}

export function bookingStatusTone(status: string): BadgeTone {
  if (status === "COMPLETED") return "success";
  if (status === "IN_PROGRESS") return "info";
  if (status === "READY_FOR_PICKUP") return "navy";
  if (status === "CONFIRMED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "REJECTED") return "danger";
  return "neutral";
}

export function maintenanceStatusTone(status: string): BadgeTone {
  if (status === "COMPLETED") return "success";
  if (status === "IN_PROGRESS") return "info";
  if (status === "SCHEDULED") return "warning";
  return "neutral";
}

/** Accept absolute http(s) URLs and root-relative paths. */
export function isSafeImageUrl(url: string): boolean {
  return /^(https?:\/\/[^\s]+|\/[^\s]*)$/i.test(url.trim());
}

export function availabilityLabel(
  dict: Dictionary,
  availability: FleetAvailability
): string {
  return dict.fleet.list.availability[availability];
}
