"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Car,
  ChevronDown,
  Download,
  Eye,
  Pencil,
  Search,
  Users,
  X,
} from "lucide-react";

import {
  Badge,
  Button,
  DataTable,
  Select,
  buttonClass,
  type Column,
} from "@/components/admin/ui";
import { getDict, canonicalEnum, tEnum, type Locale } from "@/i18n";
import { formatCurrency, formatDate } from "@/lib/utils";

import { downloadCsv } from "./csv";
import {
  availabilityLabel,
  availabilityTone,
  carStatusTone,
} from "./helpers";
import type { FleetLocationOption, FleetRow } from "./types";

type EnumGroup = "category" | "transmission" | "fuel" | "carStatus";

const enumValueOf = (row: FleetRow, group: EnumGroup): string =>
  group === "category"
    ? row.category
    : group === "transmission"
      ? row.transmission
      : group === "fuel"
        ? row.fuelType
        : row.status;

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-9 min-w-36 appearance-none pe-8 text-sm"
      >
        {children}
      </Select>
      <ChevronDown
        className="pointer-events-none absolute end-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-muted"
        aria-hidden
      />
    </div>
  );
}

export default function FleetTable({
  lang,
  rows,
  locations,
}: {
  lang: Locale;
  rows: FleetRow[];
  locations: FleetLocationOption[];
}) {
  const dict = getDict(lang);
  const t = dict.fleet.list;

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fuel, setFuel] = useState("");
  const [location, setLocation] = useState("");

  const hasFilters =
    query.trim() !== "" ||
    status !== "" ||
    category !== "" ||
    transmission !== "" ||
    fuel !== "" ||
    location !== "";

  function resetFilters() {
    setQuery("");
    setStatus("");
    setCategory("");
    setTransmission("");
    setFuel("");
    setLocation("");
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (status && canonicalEnum("carStatus", enumValueOf(row, "carStatus")) !== status) return false;
      if (category && canonicalEnum("category", enumValueOf(row, "category")) !== category) return false;
      if (transmission && canonicalEnum("transmission", enumValueOf(row, "transmission")) !== transmission) return false;
      if (fuel && canonicalEnum("fuel", enumValueOf(row, "fuel")) !== fuel) return false;
      if (location && row.locationId !== location) return false;
      if (q) {
        const haystack =
          `${row.name} ${row.brand} ${row.model} ${row.plateNumber ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [rows, query, status, category, transmission, fuel, location]);

  // These columns are free text, so `Diesel` and `DIESEL` are one value and an
  // option is only offered when the fleet really holds it.
  const optionsFor = (group: EnumGroup) =>
    [...new Set(rows.map((row) => canonicalEnum(group, enumValueOf(row, group))))]
      .filter((value) => value !== "")
      .sort((a, b) => a.localeCompare(b, lang));

  function exportCsv() {
    const headers = Object.values(t.csv.headers);
    const data = filtered.map((row) => [
      row.name,
      row.brand,
      row.model,
      row.plateNumber ?? "",
      row.year ?? "",
      tEnum(dict, "category", row.category),
      tEnum(dict, "transmission", row.transmission),
      tEnum(dict, "fuel", row.fuelType),
      row.seats,
      row.doors,
      row.dailyPrice,
      tEnum(dict, "carStatus", row.status),
      availabilityLabel(dict, row.availability),
      row.locationName ?? "",
      formatDate(row.createdAt, lang),
    ]);
    downloadCsv(
      `${t.csv.filename}-${new Date().toISOString().slice(0, 10)}`,
      headers,
      data
    );
  }

  const columns: Column<FleetRow>[] = [
    {
      key: "name",
      header: t.columns.vehicle,
      sortValue: (row) => row.name,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg border border-admin-line bg-slate-100">
            {row.imageUrl ? (
              // External URLs are user-provided; the public site also uses <img>.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.imageUrl}
                alt={row.imageAlt ?? row.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-admin-muted">
                <Car className="h-5 w-5" aria-hidden />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/${lang}/admin/cars/${row.id}`}
              className="block max-w-52 truncate font-medium text-admin-ink transition-colors hover:text-admin-navy-3"
            >
              {row.name}
            </Link>
            <p className="mt-0.5 text-xs text-admin-muted">
              {row.plateNumber ?? dict.fleet.detail.noPlate}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "year",
      header: t.columns.year,
      sortValue: (row) => row.year,
      cell: (row) => (
        <span className="tabular-nums">
          {row.year ?? dict.fleet.detail.specs.notProvided}
        </span>
      ),
      className: "w-16",
    },
    {
      key: "category",
      header: t.columns.category,
      sortValue: (row) => row.category,
      cell: (row) => (
        <Badge tone="navy">{tEnum(dict, "category", row.category)}</Badge>
      ),
    },
    {
      key: "transmission",
      header: t.columns.transmissionFuel,
      cell: (row) => (
        <div className="text-sm">
          <p className="text-admin-ink">
            {tEnum(dict, "transmission", row.transmission)}
          </p>
          <p className="text-xs text-admin-muted">
            {tEnum(dict, "fuel", row.fuelType)}
          </p>
        </div>
      ),
      secondary: true,
    },
    {
      key: "seats",
      header: t.columns.seats,
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Users className="h-3.5 w-3.5 text-admin-muted" aria-hidden />
          {row.seats}
        </span>
      ),
      secondary: true,
    },
    {
      key: "dailyPrice",
      header: t.columns.dailyPrice,
      sortValue: (row) => row.dailyPrice,
      cell: (row) => (
        <span className="font-semibold tabular-nums">
          {formatCurrency(row.dailyPrice, lang)}
        </span>
      ),
    },
    {
      key: "availability",
      header: t.columns.availability,
      cell: (row) => (
        <div>
          <Badge tone={availabilityTone(row.availability)}>
            {availabilityLabel(dict, row.availability)}
          </Badge>
          {row.bookingsCount + row.maintenancesCount > 0 ? (
            <p className="mt-1 text-[11px] text-admin-muted">
              {t.counts
                .replace("{bookings}", String(row.bookingsCount))
                .replace("{maintenance}", String(row.maintenancesCount))}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: t.columns.status,
      cell: (row) => (
        <Badge tone={carStatusTone(row.status)}>
          {tEnum(dict, "carStatus", row.status)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: t.columns.added,
      sortValue: (row) => row.createdAt,
      cell: (row) => (
        <span className="whitespace-nowrap text-xs text-admin-muted">
          {formatDate(row.createdAt, lang)}
        </span>
      ),
      secondary: true,
    },
    {
      key: "actions",
      header: t.columns.actions,
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/${lang}/admin/cars/${row.id}`}
            aria-label={`${t.view} — ${row.name}`}
            title={t.view}
            className={buttonClass("ghost", "sm")}
          >
            <Eye className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={`/${lang}/admin/cars/${row.id}#edit`}
            aria-label={`${t.edit} — ${row.name}`}
            title={t.edit}
            className={buttonClass("ghost", "sm")}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ),
    },
  ];

  const toolbar = (
    <div className="flex w-full flex-wrap items-center gap-2">
      <div className="relative min-w-52 flex-1">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          className="h-9 w-full rounded-lg border border-admin-line bg-admin-surface ps-9 pe-3 text-sm text-admin-ink placeholder:text-admin-muted/60 focus:border-admin-navy-3 focus:outline-none focus:ring-2 focus:ring-admin-navy/10"
        />
      </div>

      <FilterSelect
        label={t.filters.status}
        value={status}
        onChange={setStatus}
      >
        <option value="">{t.filters.allStatuses}</option>
        {optionsFor("carStatus").map((value) => (
          <option key={value} value={value}>
            {tEnum(dict, "carStatus", value)}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        label={t.filters.category}
        value={category}
        onChange={setCategory}
      >
        <option value="">{t.filters.allCategories}</option>
        {optionsFor("category").map((value) => (
          <option key={value} value={value}>
            {tEnum(dict, "category", value)}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        label={t.filters.transmission}
        value={transmission}
        onChange={setTransmission}
      >
        <option value="">{t.filters.allTransmissions}</option>
        {optionsFor("transmission").map((value) => (
          <option key={value} value={value}>
            {tEnum(dict, "transmission", value)}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        label={t.filters.fuel}
        value={fuel}
        onChange={setFuel}
      >
        <option value="">{t.filters.allFuels}</option>
        {optionsFor("fuel").map((value) => (
          <option key={value} value={value}>
            {tEnum(dict, "fuel", value)}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        label={t.filters.location}
        value={location}
        onChange={setLocation}
      >
        <option value="">{t.filters.allLocations}</option>
        {locations.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </FilterSelect>

      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="h-4 w-4" aria-hidden />
          {t.filters.clear}
        </Button>
      ) : null}

      <Button
        variant="secondary"
        size="sm"
        onClick={exportCsv}
        disabled={filtered.length === 0}
      >
        <Download className="h-4 w-4" aria-hidden />
        {t.exportCsv}
      </Button>
    </div>
  );

  return (
    <DataTable
      rows={filtered}
      columns={columns}
      getRowKey={(row) => row.id}
      toolbar={toolbar}
      defaultPageSize={10}
      initialSort={{ key: "createdAt", dir: "desc" }}
      emptyIcon={Car}
      emptyTitle={
        rows.length === 0 ? t.emptyTitle : t.noResultsTitle
      }
      emptyDescription={
        rows.length === 0 ? t.emptyDescription : t.noResultsDescription
      }
    />
  );
}
