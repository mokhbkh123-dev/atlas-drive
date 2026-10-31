"use client";

import { cn } from "./utils";

export const inputClass =
  "w-full rounded-lg border border-admin-line bg-admin-surface px-3 py-2 text-sm text-admin-ink placeholder:text-admin-muted/60 focus:border-admin-gold focus:outline-none focus:ring-2 focus:ring-admin-gold/20 disabled:cursor-not-allowed disabled:opacity-50";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-[13px] font-medium text-admin-ink", className)}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClass, "min-h-24", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputClass, "appearance-none pe-8", className)} {...props}>
      {children}
    </select>
  );
}

/** Label + control + inline validation error. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error ? (
        <p className="mt-1 text-xs text-admin-muted">{hint}</p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-1 text-xs font-medium text-[#b91c1c]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
