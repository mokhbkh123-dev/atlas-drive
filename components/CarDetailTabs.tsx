"use client";

import { useRef, useState } from "react";

export type DetailTab = {
  id: string;
  label: string;
  panel: React.ReactNode;
};

export default function CarDetailTabs({
  tabs,
  tablistLabel,
}: {
  tabs: DetailTab[];
  tablistLabel: string;
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const rtl = document.dir === "rtl";
    const direction =
      (event.key === "ArrowRight" ? 1 : -1) * (rtl ? -1 : 1);
    const index = tabs.findIndex((tab) => tab.id === active);
    const next = tabs[(index + direction + tabs.length) % tabs.length];
    if (!next) return;
    setActive(next.id);
    refs.current[next.id]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={tablistLabel}
        className="flex flex-wrap gap-x-6 gap-y-1 border-b border-line"
      >
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                refs.current[tab.id] = node;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={move}
              className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${
                selected
                  ? "border-bronze text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== active}
          className="pt-6"
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
