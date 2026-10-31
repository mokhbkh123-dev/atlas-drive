import type { BookingSource, BookingStatus } from "@prisma/client";

export type DeltaDirection = "up" | "down" | "flat";

/** `null` means there is no previous-period data — display "—", never 0. */
export type DeltaInfo = {
  available: boolean;
  percent: number;
  direction: DeltaDirection;
} | null;

export type StatusCount = { status: BookingStatus; count: number };
export type SourceCount = { source: BookingSource; count: number };

/** Serializable point passed to the client chart components. */
export type DayPoint = {
  /** `YYYY-MM-DD` */
  date: string;
  label: string;
  value: number;
};

export type VehicleRevenue = {
  id: string;
  name: string;
  revenue: number;
};

export type DashboardKpis = {
  revenue: { value: number; delta: DeltaInfo };
  outstanding: { value: number; count: number };
  bookings: {
    value: number;
    delta: DeltaInfo;
    byStatus: StatusCount[];
  };
  utilization: {
    percent: number;
    delta: DeltaInfo;
    rentedDays: number;
    capacityDays: number;
  };
  fleet: {
    published: number;
    rented: number;
    available: number;
    maintenance: number;
  };
  newCustomers: { value: number; delta: DeltaInfo; total: number };
};

export type BookingRowData = {
  id: string;
  ref: string;
  customer: string;
  car: string;
  status: BookingStatus;
  amount: number;
  balance: number | null;
  pickupAt: string;
  returnAt: string;
  createdAt: string;
};

export type MaintenanceRowData = {
  id: string;
  carId: string;
  car: string;
  type: string;
  status: string;
  startAt: string;
  endAt: string;
};

export type ActivityRowData = {
  id: string;
  action: string;
  summary: string;
  actor: string;
  createdAt: string;
};

export type SectionList<T> = {
  count: number;
  items: T[];
};

export type DashboardSections = {
  pickups: SectionList<BookingRowData>;
  returns: SectionList<BookingRowData>;
  pending: SectionList<BookingRowData>;
  overdue: SectionList<BookingRowData>;
  unpaid: SectionList<BookingRowData>;
  maintenance: SectionList<MaintenanceRowData>;
  recentBookings: SectionList<BookingRowData>;
  activity: SectionList<ActivityRowData>;
};

export type UtilizationChartData = {
  percent: number;
  rentedDays: number;
  capacityDays: number;
  /** `null` when the previous window had no utilization data. */
  previousPercent: number | null;
};

export type DashboardCharts = {
  revenue: DayPoint[];
  bookings: DayPoint[];
  statuses: StatusCount[];
  topVehicles: VehicleRevenue[];
  sources: SourceCount[];
  utilization: UtilizationChartData;
};

export type DashboardData = {
  range: {
    from: string;
    to: string;
    days: number;
  };
  kpis: DashboardKpis;
  charts: DashboardCharts;
  sections: DashboardSections;
};
