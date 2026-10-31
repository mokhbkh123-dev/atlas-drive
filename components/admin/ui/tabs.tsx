"use client";

import { cn } from "./utils";

export type Tab = { key: string; label: string; count?: number };

/** Segmented tabs used across admin detail pages. */
export function Tabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: Tab[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-lg border border-admin-line bg-admin-surface p-1",
        className
      )}
    >
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-admin-navy text-white shadow-sm"
                : "text-admin-muted hover:bg-admin-bg hover:text-admin-ink"
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span
                className={cn(
                  "ms-1.5 rounded-full px-1.5 py-0.5 text-[11px]",
                  active ? "bg-admin-surface/20 text-white" : "bg-admin-bg text-admin-muted"
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  active,
  tab,
  children,
}: {
  active: string;
  tab: string;
  children: React.ReactNode;
}) {
  if (active !== tab) return null;
  return (
    <div role="tabpanel" className="mt-4">
      {children}
    </div>
  );
}
