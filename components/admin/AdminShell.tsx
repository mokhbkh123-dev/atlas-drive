"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Car,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Users,
  UserCog,
  Wrench,
  CalendarDays,
  Bell,
  X,
  LayoutDashboard,
} from "lucide-react";

import AdminLanguageSwitcher from "./LanguageSwitcher";
import NotificationsBell from "./NotificationsBell";
import GlobalSearch from "./GlobalSearch";
import Dropdown, { DropdownItem } from "./ui/dropdown";
import { QUICK_ACTIONS } from "./nav";
import { can, modulesFor } from "@/lib/access";
import { getDict, type Locale } from "@/i18n";
import type { UserRole } from "@prisma/client";
import { cn } from "./ui/utils";

type ShellUser = { name: string; email: string; role: UserRole };

const COLLAPSE_KEY = "atlas-admin-sidebar-collapsed";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

const ATLAS_NAV = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard, label: "Tableau de bord" },
  { key: "fleet", href: "/admin/cars", icon: Car, label: "Voitures" },
  { key: "reservations", href: "/admin/bookings", icon: CalendarDays, label: "Réservations" },
  { key: "maintenance", href: "/admin/maintenance", icon: Wrench, label: "Maintenance" },
  { key: "customers", href: "/admin/customers", icon: Users, label: "Clients" },
  { key: "staff", href: "/admin/staff", icon: UserCog, label: "Utilisateurs" },
  { key: "reports", href: "/admin/reports", icon: BarChart3, label: "Rapports" },
  { key: "settings", href: "/admin/settings", icon: Settings, label: "Paramètres" },
];

/** Breadcrumb trail derived from the current pathname. */
function useBreadcrumbs(lang: Locale, pathname: string) {
  const dict = getDict(lang);
  const t = dict.adminLayout;
  const base = `/${lang}/admin`;
  if (pathname === base) return [];

  const rest = pathname.startsWith(base + "/")
    ? pathname.slice(base.length + 1).split("/")
    : [];

  const trail: { label: string; href?: string }[] = [];
  const moduleLabel = (seg: string): string | null => {
    const item = ATLAS_NAV.find(
      (i) => i.href === `/admin/${seg}`
    );
    if (item) return item.label;
    return null;
  };

  rest.forEach((seg, idx) => {
    const label = moduleLabel(seg);
    if (label) {
      trail.push({ label, href: `${base}/${seg}` });
    } else if (seg === "new") {
      trail.push({ label: t.breadcrumbs.new });
    } else if (seg === "forbidden") {
      trail.push({ label: t.breadcrumbs.forbidden });
    } else if (idx === rest.length - 1) {
      trail.push({ label: t.breadcrumbs.details });
    }
  });
  return trail;
}

export default function AdminShell({
  lang,
  user,
  unread,
  children,
}: {
  lang: Locale;
  user: ShellUser;
  unread: number;
  children: React.ReactNode;
}) {
  const dict = getDict(lang);
  const t = dict.adminLayout;
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // private mode — ignore
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  // Close the mobile drawer on navigation.
  useEffect(() => setMobileOpen(false), [pathname]);

  const allowed = modulesFor(user.role);
  const breadcrumbs = useBreadcrumbs(lang, pathname);

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === `/${lang}/admin` || pathname === `/${lang}/admin/`;
    return pathname === `/${lang}${href}` || pathname.startsWith(`/${lang}${href}/`);
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push(`/${lang}/admin/login`);
    router.refresh();
  }

  const sidebarNav = (
    <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-2" aria-label="Navigation">
      <ul className="space-y-1">
        {ATLAS_NAV.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          // Only show items user has access to where applicable - keep all for now to match spec
          return (
            <li key={item.key}>
              <Link
                href={`/${lang}${item.href}`}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  collapsed && "justify-center px-2 py-2.5",
                  active
                    ? "bg-[#e5b94f] text-[#0a0a0a] shadow-sm"
                    : "text-[#f4f5f7]/80 hover:bg-admin-surface/5 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-colors",
                    active ? "text-[#0a0a0a]" : "text-white/70 group-hover:text-white"
                  )}
                  aria-hidden
                />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const sidebarInner = (
    <>
      <div className="flex flex-col items-center justify-center gap-1 px-4 py-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2L18 10H10L14 2Z" fill="#e5b94f" />
            <path d="M6 12L14 6L22 12L19 22H9L6 12Z" stroke="#e5b94f" strokeWidth="1.5" fill="none" />
            <path d="M14 6V22" stroke="#e5b94f" strokeWidth="1" opacity="0.5" />
          </svg>
          {!collapsed ? (
            <div className="text-center">
              <div className="text-sm font-bold tracking-[0.25em] uppercase text-white">ATLAS DRIVE</div>
              <div className="text-[9px] font-medium uppercase tracking-[0.4em] text-[#e5b94f]/90 mt-0.5">CAR RENTAL</div>
            </div>
          ) : null}
        </div>
      </div>
      {sidebarNav}
      {!collapsed && (
        <div className="mx-3 mb-4 mt-auto">
          <div className="relative overflow-hidden rounded-lg border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <img 
              src="https://images.unsplash.com/photo-1555353540-64580b51c258?q=80&w=800&auto=format&fit=crop" 
              alt="Luxury SUV"
              className="h-32 w-full object-cover"
            />
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-[10px] leading-tight text-[#e5b94f] font-medium">
                Des voitures d'exception<br/>pour vos plus beaux trajets
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="border-t border-white/5 px-3 py-2">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? t.sidebar.expand : t.sidebar.collapse}
          className={cn(
            "hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-admin-surface/5 hover:text-white lg:flex",
            collapsed && "justify-center px-2"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate text-xs">{t.sidebar.collapse}</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  const getPageTitle = () => {
    if (pathname === `/${lang}/admin` || pathname === `/${lang}/admin/`) return "Tableau de bord";
    if (pathname.includes("/admin/cars")) return "Gestion des voitures";
    if (pathname.includes("/admin/bookings")) return "Réservations";
    if (pathname.includes("/admin/maintenance")) return "Maintenance";
    if (pathname.includes("/admin/customers")) return "Clients";
    if (pathname.includes("/admin/staff")) return "Utilisateurs";
    if (pathname.includes("/admin/reports")) return "Rapports";
    if (pathname.includes("/admin/settings")) return "Paramètres";
    return breadcrumbs[breadcrumbs.length - 1]?.label || "Tableau de bord";
  };

  return (
    <div className="flex min-h-screen bg-[#080d14]">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 hidden flex-col bg-[#030609] border-r border-white/5 transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-[230px]"
        )}
      >
        {sidebarInner}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 opacity-100 transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 start-0 flex w-[230px] flex-col bg-[#030609] opacity-100 shadow-2xl">
            <button
              type="button"
              aria-label={t.sidebar.closeMenu}
              onClick={() => setMobileOpen(false)}
              className="absolute end-3 top-4 rounded-lg p-1.5 text-white/60 hover:bg-admin-surface/10 hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            {sidebarInner}
          </div>
        </div>
      ) : null}

      {/* Workspace */}
      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col transition-[margin] duration-200",
          collapsed ? "lg:ms-[76px]" : "lg:ms-[230px]"
        )}
      >
        <header className="sticky top-0 z-30 border-b border-[#202c3a] bg-[#080d14]">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              aria-label={t.sidebar.openMenu}
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-admin-surface/5 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? t.sidebar.expand : t.sidebar.collapse}
              className="hidden h-8 w-8 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-admin-surface/5 hover:text-white lg:inline-flex"
            >
              <Menu className="h-4 w-4" aria-hidden />
            </button>

            <span className="text-sm font-semibold text-[#f4f5f7]">
              {getPageTitle()}
            </span>

            <div className="flex-1" />

            <button className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-admin-surface/5 hover:text-white">
              <Bell className="h-4 w-4" aria-hidden />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#fa655e]" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1a2332] to-[#0d141e] text-xs font-semibold text-[#e5b94f] ring-1 ring-[#e5b94f]/40">
                {initials(user.name)}
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-medium text-[#f4f5f7]">{user.name || "Admin"}</span>
                <span className="text-[10px] text-[#8190a1]">{t.roles[user.role] || "Administrateur"}</span>
              </div>
              <ChevronDown className="h-3 w-3 text-[#8190a1]" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
