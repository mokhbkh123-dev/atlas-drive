import type { BookingStatus } from "@prisma/client";

import type { BadgeTone } from "@/components/admin/ui";

/** Shared status → Badge tone mapping for KPI chips and list rows. */
export const BOOKING_STATUS_TONE: Record<BookingStatus, BadgeTone> = {
  PENDING: "warning",
  CONFIRMED: "info",
  READY_FOR_PICKUP: "info",
  IN_PROGRESS: "navy",
  COMPLETED: "success",
  CANCELLED: "neutral",
  REJECTED: "danger",
};
