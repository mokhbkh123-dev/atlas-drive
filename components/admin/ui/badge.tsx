import { cn } from "./utils";

export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "navy"
  | "accent";

// The panel is a dark navy surface, so every tone is a tinted wash with a
// matching bright label rather than a pale chip.
const TONES: Record<BadgeTone, string> = {
  neutral: "bg-admin-neutral/10 text-admin-neutral border-admin-neutral/25",
  success: "bg-admin-success/10 text-admin-success border-admin-success/25",
  warning: "bg-admin-warning/10 text-admin-warning border-admin-warning/25",
  danger: "bg-admin-danger/10 text-admin-danger border-admin-danger/25",
  info: "bg-sky-400/10 text-sky-300 border-sky-400/25",
  navy: "bg-admin-gold/10 text-admin-gold border-admin-gold/25",
  accent: "bg-[#fa655e]/15 text-[#ff9b95] border-[#fa655e]/30",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        TONES[tone],
        className
      )}
      {...props}
    />
  );
}
