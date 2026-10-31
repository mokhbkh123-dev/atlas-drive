"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Search } from "lucide-react";

import EmptyState from "./empty-state";
import { Skeleton } from "./skeleton";
import { TH, TD, TR, Table } from "./table";
import { cn } from "./utils";

export type Column<T> = {
  key: string;
  /** Header label (pre-translated by the caller). */
  header: string;
  /** Cell renderer — receives the row. */
  cell: (row: T) => React.ReactNode;
  /** Value used for client-side sorting; omit to disable sorting. */
  sortValue?: (row: T) => string | number | null;
  className?: string;
  /** Hide on small screens. */
  secondary?: boolean;
};

type SortState = { key: string; dir: "asc" | "desc" } | null;

/**
 * Generic client-side data table: search, column sorting, pagination,
 * empty/loading states. Data volumes in this app are moderate, so filtering
 * happens in the browser over the server-fetched rows.
 */
export default function DataTable<T>({
  rows,
  columns,
  getRowKey,
  searchKeys,
  searchPlaceholder,
  pageSizeOptions = [10, 25, 50],
  defaultPageSize = 10,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  toolbar,
  onRowClick,
  initialSort = null,
}: {
  rows: T[];
  columns: Column<T>[];
  getRowKey: (row: T) => string;
  searchKeys?: (row: T) => string;
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  loading?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyIcon?: React.ElementType;
  /** Extra controls rendered next to the search input (filters, export…). */
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
  initialSort?: SortState;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>(initialSort);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const filtered = useMemo(() => {
    let list = rows;
    const q = query.trim().toLowerCase();
    if (q && searchKeys) {
      list = list.filter((row) => searchKeys(row).toLowerCase().includes(q));
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        const factor = sort.dir === "asc" ? 1 : -1;
        list = [...list].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          if (av === bv) return 0;
          if (av === null || av === undefined) return 1;
          if (bv === null || bv === undefined) return -1;
          if (typeof av === "number" && typeof bv === "number")
            return (av - bv) * factor;
          return String(av).localeCompare(String(bv)) * factor;
        });
      }
    }
    return list;
  }, [rows, query, sort, columns, searchKeys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  function toggleSort(key: string) {
    setPage(0);
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  return (
    <div className="rounded-xl border border-admin-line bg-admin-surface shadow-[0_1px_2px_rgba(15,27,51,0.05)]">
      {(searchKeys || toolbar) && (
        <div className="flex flex-wrap items-center gap-3 border-b border-admin-line px-4 py-3">
          {searchKeys ? (
            <div className="relative min-w-48 flex-1">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-9 w-full rounded-lg border border-admin-line bg-admin-surface ps-9 pe-3 text-sm text-admin-ink placeholder:text-admin-muted/60 focus:border-admin-navy-3 focus:outline-none focus:ring-2 focus:ring-admin-navy/10"
              />
            </div>
          ) : null}
          {toolbar}
        </div>
      )}

      {loading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              {columns.map((col) => (
                <TH key={col.key} className={cn(col.secondary && "hidden md:table-cell")}>
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-admin-ink"
                    >
                      {col.header}
                      {sort?.key === col.key ? (
                        sort.dir === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                        )
                      ) : null}
                    </button>
                  ) : (
                    col.header
                  )}
                </TH>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <TR
                key={getRowKey(row)}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <TD key={col.key} className={cn(col.secondary && "hidden md:table-cell")}>
                    {col.cell(row)}
                  </TD>
                ))}
              </TR>
            ))}
          </tbody>
        </Table>
      )}

      {!loading && filtered.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-xs text-admin-muted">
            {safePage * pageSize + 1}–{Math.min(filtered.length, (safePage + 1) * pageSize)}{" "}
            / {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              aria-label="Rows per page"
              className="h-8 rounded-lg border border-admin-line bg-admin-surface px-2 text-xs text-admin-ink focus:outline-none"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-admin-line text-admin-muted transition-colors hover:bg-admin-bg disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-admin-line text-admin-muted transition-colors hover:bg-admin-bg disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
