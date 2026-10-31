/** Page title block with optional description and action buttons. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        className ??
        "mb-6 flex flex-wrap items-start justify-between gap-4 sm:items-center"
      }
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-admin-ink sm:text-2xl">
          <span className="bg-gradient-to-r from-admin-ink via-[#2f3320] to-admin-gold bg-clip-text text-transparent">
            {title}
          </span>
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-admin-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
