import {
  BarChart3,
  Bell,
  CalendarDays,
  CalendarRange,
  Car,
  CreditCard,
  Globe,
  History,
  LayoutDashboard,
  Megaphone,
  MapPin,
  ReceiptText,
  Settings,
  Star,
  UserCog,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ModuleId } from "@/lib/access";

export type NavEntry = {
  module: ModuleId;
  /** Pathname without locale prefix. */
  href: string;
  icon: LucideIcon;
};

export type NavGroupKey =
  | "overview"
  | "operations"
  | "finance"
  | "marketing"
  | "system";

export type NavGroup = { key: NavGroupKey; items: NavEntry[] };

/**
 * Modules whose pages currently exist. Extended between development waves —
 * never link to a route that has not been implemented (no fake links).
 */
export const IMPLEMENTED_MODULES: ModuleId[] = [
  "dashboard",
  "fleet",
  "reservations",
  "calendar",
  "availability",
  "maintenance",
];

const GROUPS: NavGroup[] = [
  {
    key: "overview",
    items: [
      { module: "dashboard", href: "/admin", icon: LayoutDashboard },
      { module: "calendar", href: "/admin/calendar", icon: CalendarRange },
      { module: "availability", href: "/admin/availability", icon: CalendarDays },
    ],
  },
  {
    key: "operations",
    items: [
      { module: "fleet", href: "/admin/cars", icon: Car },
      { module: "reservations", href: "/admin/bookings", icon: CalendarDays },
      { module: "customers", href: "/admin/customers", icon: Users },
      { module: "maintenance", href: "/admin/maintenance", icon: Wrench },
      { module: "locations", href: "/admin/locations", icon: MapPin },
    ],
  },
  {
    key: "finance",
    items: [
      { module: "payments", href: "/admin/payments", icon: CreditCard },
      { module: "invoices", href: "/admin/invoices", icon: ReceiptText },
      { module: "expenses", href: "/admin/expenses", icon: Wallet },
      { module: "reports", href: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    key: "marketing",
    items: [
      { module: "promotions", href: "/admin/promotions", icon: Megaphone },
      { module: "reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    key: "system",
    items: [
      { module: "staff", href: "/admin/staff", icon: UserCog },
      { module: "notifications", href: "/admin/notifications", icon: Bell },
      { module: "content", href: "/admin/content", icon: Globe },
      { module: "activityLogs", href: "/admin/activity-logs", icon: History },
      { module: "settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export const NAV_GROUPS: NavGroup[] = GROUPS.map((group) => ({
  ...group,
  items: group.items.filter((item) =>
    IMPLEMENTED_MODULES.includes(item.module)
  ),
})).filter((group) => group.items.length > 0);

export type QuickAction = {
  module: ModuleId;
  href: string;
  icon: LucideIcon;
  label: "addVehicle" | "newReservation" | "registerCustomer" | "addPayment" | "addExpense" | "generateInvoice";
};

const ALL_QUICK_ACTIONS: QuickAction[] = [
  { module: "fleet", href: "/admin/cars/new", icon: Car, label: "addVehicle" },
  { module: "reservations", href: "/admin/bookings/new", icon: CalendarDays, label: "newReservation" },
  { module: "customers", href: "/admin/customers/new", icon: Users, label: "registerCustomer" },
  { module: "payments", href: "/admin/payments/new", icon: CreditCard, label: "addPayment" },
  { module: "expenses", href: "/admin/expenses/new", icon: Wallet, label: "addExpense" },
  { module: "invoices", href: "/admin/invoices/new", icon: ReceiptText, label: "generateInvoice" },
];

export const QUICK_ACTIONS: QuickAction[] = ALL_QUICK_ACTIONS.filter((a) =>
  IMPLEMENTED_MODULES.includes(a.module)
);
