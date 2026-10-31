import type { UserRole } from "@prisma/client";

/**
 * Pure role → module matrix (spec §15). Safe to import from client components
 * (no server-only deps) — the sidebar uses it to hide items, while every API
 * route independently re-checks with `apiAuth()` in lib/rbac.ts.
 */

export const MODULES = [
  "dashboard",
  "fleet",
  "availability",
  "maintenance",
  "reservations",
  "customers",
  "calendar",
  "payments",
  "invoices",
  "expenses",
  "reports",
  "promotions",
  "reviews",
  "locations",
  "staff",
  "notifications",
  "content",
  "activityLogs",
  "settings",
] as const;

export type ModuleId = (typeof MODULES)[number];

export const ACCESS: Record<ModuleId, UserRole[]> = {
  dashboard: ["SUPER_ADMIN", "MANAGER", "AGENT", "FINANCE", "FLEET_MANAGER"],
  notifications: ["SUPER_ADMIN", "MANAGER", "AGENT", "FINANCE", "FLEET_MANAGER"],
  fleet: ["SUPER_ADMIN", "MANAGER", "FLEET_MANAGER"],
  availability: ["SUPER_ADMIN", "MANAGER", "FLEET_MANAGER"],
  maintenance: ["SUPER_ADMIN", "MANAGER", "FLEET_MANAGER"],
  reservations: ["SUPER_ADMIN", "MANAGER", "AGENT"],
  customers: ["SUPER_ADMIN", "MANAGER", "AGENT"],
  calendar: ["SUPER_ADMIN", "MANAGER", "AGENT", "FLEET_MANAGER"],
  payments: ["SUPER_ADMIN", "MANAGER", "FINANCE"],
  invoices: ["SUPER_ADMIN", "MANAGER", "FINANCE"],
  expenses: ["SUPER_ADMIN", "MANAGER", "FINANCE"],
  reports: ["SUPER_ADMIN", "MANAGER", "FINANCE"],
  promotions: ["SUPER_ADMIN", "MANAGER"],
  reviews: ["SUPER_ADMIN", "MANAGER"],
  locations: ["SUPER_ADMIN", "MANAGER"],
  staff: ["SUPER_ADMIN"],
  content: ["SUPER_ADMIN", "MANAGER"],
  activityLogs: ["SUPER_ADMIN", "MANAGER"],
  settings: ["SUPER_ADMIN", "MANAGER"],
};

export function can(role: UserRole, module: ModuleId): boolean {
  return ACCESS[module].includes(role);
}

export function modulesFor(role: UserRole): ModuleId[] {
  return MODULES.filter((m) => ACCESS[m].includes(role));
}
