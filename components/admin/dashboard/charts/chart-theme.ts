/** Shared chart palette (spec §3) and Recharts styling tokens. */
export const CHART_COLORS = {
  navy: "#0f0f0f",
  red: "#c9a961",
  blue: "#b8943a",
  teal: "#a88a3a",
  amber: "#d9b75b",
  slate: "#6b6f5c",
  slateLight: "#9b9f8a",
  line: "#e6e3dc",
  muted: "#6b6f5c",
  grid: "#f0ede6",
} as const;

export const AXIS_TICK = { fontSize: 11, fill: CHART_COLORS.muted } as const;

export const TOOLTIP_PROPS = {
  contentStyle: {
    borderRadius: 12,
    border: `1px solid ${CHART_COLORS.line}`,
    boxShadow: "0 8px 24px rgba(15, 27, 51, 0.08)",
    fontSize: 12,
    padding: "8px 12px",
    color: CHART_COLORS.navy,
    backgroundColor: "#ffffff",
  },
  labelStyle: {
    color: CHART_COLORS.muted,
    fontSize: 11,
    marginBottom: 4,
  },
  itemStyle: {
    color: CHART_COLORS.navy,
    fontSize: 12,
    paddingTop: 2,
    paddingBottom: 2,
  },
} as const;

export const STATUS_COLORS: Record<string, string> = {
  PENDING: CHART_COLORS.amber,
  CONFIRMED: CHART_COLORS.blue,
  READY_FOR_PICKUP: CHART_COLORS.teal,
  IN_PROGRESS: CHART_COLORS.navy,
  COMPLETED: CHART_COLORS.slate,
  CANCELLED: CHART_COLORS.slateLight,
  REJECTED: CHART_COLORS.red,
};

export const SOURCE_COLORS: Record<string, string> = {
  WEB: CHART_COLORS.navy,
  ADMIN: CHART_COLORS.blue,
  PHONE: CHART_COLORS.teal,
  WALK_IN: CHART_COLORS.amber,
};
