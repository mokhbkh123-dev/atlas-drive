"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Loader2 } from "lucide-react";

import { Button, Input, Label, Tabs } from "@/components/admin/ui";
import { getDict, type Locale } from "@/i18n";

import { parseDateKey, presetRanges, type RangePreset } from "./date-range";
import { formatShortDate } from "./format";

type ActiveRange = RangePreset | "custom";

function matchPreset(from: string, to: string): ActiveRange {
  const toDate = parseDateKey(to);
  const presets = presetRanges(toDate ?? new Date());
  for (const key of ["today", "last7", "last30", "thisMonth"] as const) {
    if (presets[key].from === from && presets[key].to === to) return key;
  }
  return "custom";
}

/** Segmented date-range switcher — updates the URL, preserving other params. */
export default function DashboardRangeSwitcher({
  lang,
  from,
  to,
}: {
  lang: Locale;
  from: string;
  to: string;
}) {
  const t = getDict(lang).dashboard;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [activeRange, setActiveRange] = useState<ActiveRange>(() => matchPreset(from, to));
  const [customOpen, setCustomOpen] = useState(activeRange === "custom");
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);

  useEffect(() => {
    setCustomFrom(from);
    setCustomTo(to);
  }, [from, to]);

  useEffect(() => {
    const next = matchPreset(from, to);
    setActiveRange(next);
    setCustomOpen(next === "custom");
  }, [from, to]);

  const valid =
    Boolean(customFrom) && Boolean(customTo) && customFrom <= customTo;

  const fromDate = parseDateKey(from);
  const toDate = parseDateKey(to);
  const rangeLabel =
    fromDate && toDate
      ? `${formatShortDate(fromDate, lang)} ${t.range.separator} ${formatShortDate(toDate, lang)}`
      : `${from} ${t.range.separator} ${to}`;

  function navigate(nextFrom: string, nextTo: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", nextFrom);
    params.set("to", nextTo);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function selectRange(key: string) {
    if (key === "custom") {
      setCustomOpen(true);
      return;
    }
    const preset = presetRanges()[key as RangePreset];
    if (!preset) return;
    setCustomOpen(false);
    setCustomFrom(preset.from);
    setCustomTo(preset.to);
    navigate(preset.from, preset.to);
  }

  function applyCustom() {
    if (!valid) return;
    navigate(customFrom, customTo);
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs
          tabs={[
            { key: "today", label: t.range.today },
            { key: "last7", label: t.range.last7 },
            { key: "last30", label: t.range.last30 },
            { key: "thisMonth", label: t.range.thisMonth },
            { key: "custom", label: t.range.custom },
          ]}
          value={customOpen ? "custom" : activeRange}
          onChange={selectRange}
        />
        {isPending ? (
          <Loader2
            className="h-4 w-4 animate-spin text-admin-muted"
            aria-label={t.range.apply}
          />
        ) : null}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-admin-muted">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
        {rangeLabel}
      </p>

      {customOpen ? (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-admin-line bg-admin-surface p-2 shadow-sm">
          <div>
            <Label htmlFor="dashboard-range-from" className="text-[11px]">
              {t.range.from}
            </Label>
            <Input
              id="dashboard-range-from"
              type="date"
              value={customFrom}
              max={customTo || undefined}
              onChange={(event) => setCustomFrom(event.target.value)}
              className="h-9 w-40"
            />
          </div>
          <div>
            <Label htmlFor="dashboard-range-to" className="text-[11px]">
              {t.range.to}
            </Label>
            <Input
              id="dashboard-range-to"
              type="date"
              value={customTo}
              min={customFrom || undefined}
              onChange={(event) => setCustomTo(event.target.value)}
              className="h-9 w-40"
            />
          </div>
          <Button
            size="sm"
            onClick={applyCustom}
            disabled={!valid || isPending}
            className="h-9"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : null}
            {t.range.apply}
          </Button>
          {!valid ? (
            <p className="w-full text-xs font-medium text-admin-red">
              {t.range.invalid}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
