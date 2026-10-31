"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "./utils";

/**
 * Lightweight dropdown menu. The trigger receives onClick/aria — the panel
 * closes on outside click, ESC, or item selection.
 */
export default function Dropdown({
  trigger,
  children,
  align = "end",
  className,
  panelClassName,
  label,
}: {
  trigger: (props: {
    onClick: () => void;
    "aria-expanded": boolean;
    "aria-haspopup": "menu";
  }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "start" | "end";
  className?: string;
  panelClassName?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {trigger({
        onClick: () => setOpen((v) => !v),
        "aria-expanded": open,
        "aria-haspopup": "menu",
      })}
      {open ? (
        <div
          role="menu"
          aria-label={label}
          className={cn(
            "absolute top-[calc(100%+0.5rem)] z-50 min-w-56 overflow-hidden rounded-xl border border-admin-line bg-admin-surface py-1 shadow-xl",
            align === "end" ? "end-0" : "start-0",
            panelClassName
          )}
        >
          {children(close)}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  href,
  className,
  icon: Icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  icon?: React.ElementType;
}) {
  const cls = cn(
    "flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-admin-ink transition-colors hover:bg-admin-bg",
    className
  );
  const content = Icon ? (
    <>
      <Icon className="h-4 w-4 shrink-0 text-admin-muted" aria-hidden />
      <span className="truncate">{children}</span>
    </>
  ) : (
    children
  );
  if (href) {
    return (
      <a role="menuitem" href={href} className={cls} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" role="menuitem" className={cls} onClick={onClick}>
      {content}
    </button>
  );
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-admin-muted">
      {children}
    </p>
  );
}

export function DropdownDivider() {
  return <div className="my-1 h-px bg-admin-line" />;
}
