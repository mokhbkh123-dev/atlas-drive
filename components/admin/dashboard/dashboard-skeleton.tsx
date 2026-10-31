import { CardSkeleton, Skeleton } from "@/components/admin/ui";

function ChartSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className={
        wide
          ? "rounded-xl border border-admin-line bg-admin-surface p-5 xl:col-span-2"
          : "rounded-xl border border-admin-line bg-admin-surface p-5"
      }
    >
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-56" />
      <Skeleton className="mt-4 h-72 w-full md:h-80" />
    </div>
  );
}

/** Streamed while the dashboard aggregates are being fetched. */
export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} rows={3} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartSkeleton wide />
        <ChartSkeleton />
        <ChartSkeleton wide />
        <ChartSkeleton />
        <ChartSkeleton wide />
        <ChartSkeleton />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} rows={4} />
        ))}
      </div>
    </div>
  );
}
