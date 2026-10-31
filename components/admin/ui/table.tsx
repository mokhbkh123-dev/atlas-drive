import { cn } from "./utils";

export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn("w-full caption-bottom border-collapse text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TH({
  className,
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-b border-admin-line bg-slate-50/80 px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-admin-muted",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TD({
  className,
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "border-b border-admin-line/70 px-4 py-3 text-admin-ink align-middle",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function TR({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-colors hover:bg-admin-bg/60", className)}
      {...props}
    >
      {children}
    </tr>
  );
}
