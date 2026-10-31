"use client";

import { useState } from "react";
import type { Dictionary, Locale } from "@/i18n";
import { Tabs, TabPanel, Card, CardHeader, CardTitle, CardContent, DataTable, EmptyState, type Column } from "@/components/admin/ui";
import { tEnum } from "@/i18n";
import { bookingStatusTone, maintenanceStatusTone } from "./helpers";
import type { FleetBookingRow, FleetMaintenanceRow, FleetRevenue } from "./types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/admin/ui/badge";

export function FleetDetailTabs({
  lang,
  dict,
  bookings,
  maintenances,
  revenue,
}: {
  lang: Locale;
  dict: Dictionary;
  bookings: FleetBookingRow[];
  maintenances: FleetMaintenanceRow[];
  revenue: FleetRevenue;
}) {
  const [tab, setTab] = useState("bookings");

  const bookingCols: Column<FleetBookingRow>[] = [
    { key: "publicRef", header: dict.fleet.detail.tabs.bookingRef, cell: (r) => r.publicRef },
    { key: "customerName", header: dict.fleet.detail.tabs.customer, cell: (r) => r.customerName },
    {
      key: "pickupAt",
      header: dict.fleet.detail.availability.pickup,
      cell: (r) => formatDateTime(r.pickupAt, lang),
    },
    {
      key: "returnAt",
      header: dict.fleet.detail.availability.return,
      cell: (r) => formatDateTime(r.returnAt, lang),
    },
    {
      key: "status",
      header: dict.fleet.detail.tabs.status,
      cell: (r) => (
        <Badge tone={bookingStatusTone(r.status)}>
          {tEnum(dict, "bookingStatus", r.status)}
        </Badge>
      ),
    },
    {
      key: "totalPrice",
      header: dict.fleet.detail.tabs.total,
      className: "text-end font-medium",
      cell: (r) => <span className="text-end block">{formatCurrency(r.totalPrice, lang)}</span>,
    },
  ];

  const maintenanceCols: Column<FleetMaintenanceRow>[] = [
    { key: "type", header: dict.fleet.detail.tabs.maintenanceType, cell: (r) => r.type },
    {
      key: "startAt",
      header: dict.fleet.detail.availability.from,
      cell: (r) => formatDateTime(r.startAt, lang),
    },
    {
      key: "endAt",
      header: dict.fleet.detail.availability.to,
      cell: (r) => formatDateTime(r.endAt, lang),
    },
    {
      key: "cost",
      header: dict.fleet.detail.tabs.maintenanceCost,
      className: "text-end font-medium",
      cell: (r) => <span className="text-end block">{formatCurrency(r.cost, lang)}</span>,
    },
    {
      key: "status",
      header: dict.fleet.detail.tabs.maintenanceStatus,
      cell: (r) => (
        <Badge tone={maintenanceStatusTone(r.status)}>
          {tEnum(dict, "maintenanceStatus", r.status)}
        </Badge>
      ),
    },
    { key: "provider", header: dict.fleet.detail.tabs.maintenanceProvider, cell: (r) => r.provider ?? "—" },
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-base">
          {dict.fleet.detail.overview}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          tabs={[
            {
              key: "bookings",
              label: dict.fleet.detail.tabs.bookings,
              count: bookings.length,
            },
            {
              key: "maintenance",
              label: dict.fleet.detail.tabs.maintenance,
              count: maintenances.length,
            },
            { key: "revenue", label: dict.fleet.detail.tabs.revenue },
          ]}
          value={tab}
          onChange={setTab}
        />
        <TabPanel active={tab} tab="bookings">
          {bookings.length === 0 ? (
            <EmptyState
              title={dict.fleet.detail.tabs.bookings}
              description={dict.fleet.detail.tabs.emptyBookings}
            />
          ) : (
            <DataTable
              columns={bookingCols}
              rows={bookings}
              getRowKey={(r) => r.id}
              emptyTitle={dict.fleet.detail.tabs.bookings}
              emptyDescription={dict.fleet.detail.tabs.emptyBookings}
            />
          )}
        </TabPanel>
        <TabPanel active={tab} tab="maintenance">
          {maintenances.length === 0 ? (
            <EmptyState
              title={dict.fleet.detail.tabs.maintenance}
              description={dict.fleet.detail.tabs.emptyMaintenance}
            />
          ) : (
            <DataTable
              columns={maintenanceCols}
              rows={maintenances}
              getRowKey={(r) => r.id}
              emptyTitle={dict.fleet.detail.tabs.maintenance}
              emptyDescription={dict.fleet.detail.tabs.emptyMaintenance}
            />
          )}
        </TabPanel>
        <TabPanel active={tab} tab="revenue">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-admin-muted">
                  {dict.fleet.detail.tabs.completedRevenue}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">
                  {formatCurrency(revenue.completedRevenue, lang)}
                </div>
                <div className="mt-1 text-xs text-admin-muted">
                  {revenue.completedCount} {dict.fleet.detail.tabs.completedRentals}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-admin-muted">
                  {dict.fleet.detail.tabs.paymentsReceived}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">
                  {formatCurrency(revenue.paymentsReceived, lang)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabPanel>
      </CardContent>
    </Card>
  );
}
