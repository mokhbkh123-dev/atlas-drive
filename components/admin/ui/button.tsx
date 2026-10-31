import { cn } from "./utils";

type Variant = "primary" | "secondary" | "ghost" | "navy" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-admin-gold to-[#b8943a] text-black hover:from-admin-gold-soft hover:to-admin-gold shadow-[0_10px_40px_-18px_rgba(201,169,97,0.9)] focus-visible:ring-admin-gold/40",
  secondary:
    "bg-admin-surface text-admin-ink border border-admin-line hover:bg-admin-surface-elevated focus-visible:ring-admin-gold/30",
  ghost:
    "text-admin-muted hover:bg-admin-bg hover:text-admin-ink focus-visible:ring-admin-gold/30",
  navy: "bg-gradient-to-r from-[#0f0f0f] to-[#151515] text-admin-gold ring-1 ring-admin-gold/30 hover:from-[#151515] hover:to-[#1a1a1a] focus-visible:ring-admin-gold/40",
  danger:
    "bg-[#b91c1c] text-white hover:bg-[#991b1b] focus-visible:ring-[#b91c1c]/40",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

export const buttonClass = (variant: Variant = "primary", size: Size = "md") =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size]
  );

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClass(variant, size), className)}
      {...props}
    />
  );
}
