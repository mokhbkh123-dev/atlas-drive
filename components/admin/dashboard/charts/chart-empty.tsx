import { ChartNoAxesColumn } from "lucide-react";

import { cn } from "@/components/admin/ui";

/** Fixed-height placeholder shown inside a chart card when the range is empty. */
export default function ChartEmpty({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 text-center",
        className
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-admin-bg text-admin-muted">
        <ChartNoAxesColumn className="h-5 w-5" aria-hidden />
      </span>
      <p className="max-w-xs text-sm text-admin-muted">{message}</p>
    </div>
  );
}
