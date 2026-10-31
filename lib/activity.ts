import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";

/** Keys that must never be persisted to the audit trail (spec §19). */
const SENSITIVE_KEY = /password|token|secret|hash|card|cvc|cvv|iban|pan/i;

function prune(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return null;
  if (depth > 4) return "[deep]";
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => prune(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY.test(k)) continue;
      out[k] = prune(v, depth + 1);
    }
    return out;
  }
  if (typeof value === "string" && value.length > 500) return value.slice(0, 500);
  return value;
}

function stringify(value: unknown): string | null {
  const pruned = prune(value);
  if (pruned === null || pruned === undefined) return null;
  try {
    const json = JSON.stringify(pruned);
    return json.length > 4000 ? json.slice(0, 4000) : json;
  } catch {
    return null;
  }
}

export type ActivityInput = {
  /** Stable dotted action, e.g. "booking.confirmed", "car.created". */
  action: string;
  entityType: string;
  entityId?: string | null;
  summary?: string | null;
  before?: unknown;
  after?: unknown;
};

/**
 * Append an audit entry. Never throws — logging must not break the mutation.
 * Pass `null` as actor for system-generated events.
 */
export async function logActivity(
  actor: SessionUser | null,
  input: ActivityInput
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: actor?.id ?? null,
        userLabel: actor ? `${actor.name} <${actor.email}>` : "system",
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        summary: input.summary ?? null,
        before: stringify(input.before),
        after: stringify(input.after),
      },
    });
  } catch (error) {
    console.error("logActivity failed:", error);
  }
}
