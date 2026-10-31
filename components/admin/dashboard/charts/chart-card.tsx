import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui";
import { cn } from "@/components/admin/ui";

/** Consistent white chart card used by every dashboard visual. */
export default function ChartCard({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="items-start">
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-admin-muted">{subtitle}</p>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">{children}</CardContent>
    </Card>
  );
}
