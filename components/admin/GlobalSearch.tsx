"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Car, CalendarDays, Loader2, ReceiptText, Search, User, X } from "lucide-react";

import { getDict, type Locale } from "@/i18n";
import { cn } from "@/components/admin/ui/utils";

type ResultGroup = {
  group: string;
  items: { id: string; title: string; subtitle?: string | null; href: string }[];
};

const GROUP_ICONS: Record<string, React.ElementType> = {
  fleet: Car,
  reservations: CalendarDays,
  customers: User,
  invoices: ReceiptText,
  payments: ReceiptText,
};

/** Global search across vehicles, reservations, customers, invoices (spec §19). */
export default function GlobalSearch({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<ResultGroup[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setGroups([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/search?q=${encodeURIComponent(q.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setGroups(data.groups);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!open) return;
    setLoading(query.trim().length >= 2);
    timer.current = setTimeout(() => runSearch(query), 280);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, open, runSearch]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const total = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div ref={wrapRef} className="relative w-full max-w-md">
      <Search
        className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted"
        aria-hidden
      />
      <input
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls="global-search-results"
        aria-label={dict.adminLayout.search.label}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder={dict.adminLayout.search.placeholder}
        className="h-9 w-full rounded-lg border border-admin-line bg-slate-50 ps-9 pe-8 text-sm text-admin-ink placeholder:text-admin-muted/70 focus:border-admin-navy-3 focus:bg-admin-surface focus:outline-none focus:ring-2 focus:ring-admin-navy/10"
      />
      {query ? (
        <button
          type="button"
          aria-label="Clear"
          onClick={() => setQuery("")}
          className="absolute end-2 top-1/2 -translate-y-1/2 text-admin-muted hover:text-admin-ink"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}

      {open && query.trim().length >= 2 ? (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute top-[calc(100%+0.4rem)] z-50 max-h-96 w-full min-w-80 overflow-y-auto rounded-xl border border-admin-line bg-admin-surface py-1 shadow-xl"
        >
          {loading ? (
            <p className="flex items-center justify-center gap-2 px-4 py-5 text-sm text-admin-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {dict.adminLayout.search.loading}
            </p>
          ) : total === 0 ? (
            <p className="px-4 py-5 text-center text-sm text-admin-muted">
              {dict.adminLayout.search.noResults}
            </p>
          ) : (
            groups.map((g) => {
              const Icon = GROUP_ICONS[g.group] ?? Search;
              const label =
                dict.adminLayout.search.groups[
                  g.group as keyof typeof dict.adminLayout.search.groups
                ] ?? g.group;
              return (
                <div key={g.group}>
                  <p className="px-3.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-admin-muted">
                    {label}
                  </p>
                  {g.items.map((item) => (
                    <button
                      key={`${g.group}-${item.id}`}
                      type="button"
                      role="option"
                      onClick={() => go(item.href)}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-start transition-colors hover:bg-admin-bg"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-admin-muted" aria-hidden />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-admin-ink">
                          {item.title}
                        </span>
                        {item.subtitle ? (
                          <span className="block truncate text-xs text-admin-muted">
                            {item.subtitle}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
