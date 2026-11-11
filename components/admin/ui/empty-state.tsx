import { cn } from "./utils";

/** Polished empty state for tables and dashboards (spec §3). */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-admin-line bg-admin-bg/40 px-6 py-14 text-center",
        className
      )}
    >
      {Icon ? (
        <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-admin-gold/10 text-admin-gold">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      ) : null}
      <p className="text-sm font-semibold text-admin-ink">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-admin-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
