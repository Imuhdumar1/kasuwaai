import * as React from "react";
import { cn } from "@/lib/utils";

/* ─── Button ──────────────────────────────────────────────────────────── */
type ButtonVariant = "primary" | "dark" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-lime text-ink hover:bg-lime-bright shadow-sm",
  dark: "bg-ink text-paper hover:bg-ink/90",
  outline: "border border-line bg-surface text-content hover:bg-surface-2",
  ghost: "text-content-muted hover:bg-surface-2 hover:text-content",
  danger: "bg-danger text-white hover:bg-danger/90",
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "h-9 w-9",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

/* ─── Card ────────────────────────────────────────────────────────────── */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-line bg-surface shadow-card", className)}
      {...props}
    />
  );
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-0", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-lg font-bold", className)} {...props} />;
}
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-content-muted", className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-5 pt-0", className)} {...props} />;
}

/* ─── Form controls ───────────────────────────────────────────────────── */
const controlBase =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted/60 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:border-lime transition disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(controlBase, "h-10", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(controlBase, "min-h-[80px]", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(controlBase, "h-10 pr-8", className)} {...props} />
));
Select.displayName = "Select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-content", className)}
      {...props}
    />
  );
}

/** Labelled field wrapper with optional hint + error. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="text-danger"> *</span>}
        </Label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-content-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

/* ─── Badge ───────────────────────────────────────────────────────────── */
type BadgeTone = "neutral" | "lime" | "success" | "warning" | "danger" | "info";
const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-content-muted",
  lime: "bg-lime/20 text-ink dark:text-lime",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  danger: "bg-danger/12 text-danger",
  info: "bg-info/12 text-info",
};
export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Maps a debt/transaction status to a coloured badge. */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: BadgeTone; label: string }> = {
    paid: { tone: "success", label: "Paid" },
    partially_paid: { tone: "warning", label: "Partially Paid" },
    unpaid: { tone: "neutral", label: "Unpaid" },
    overdue: { tone: "danger", label: "Overdue" },
    scheduled: { tone: "info", label: "Scheduled" },
  };
  const s = map[status] ?? { tone: "neutral" as BadgeTone, label: status };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

/* ─── Misc ────────────────────────────────────────────────────────────── */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Avatar({ name, src, className }: { name?: string | null; src?: string | null; className?: string }) {
  const label = (name ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name ?? ""} className={cn("h-9 w-9 rounded-full object-cover", className)} />;
  }
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime/25 text-xs font-bold text-ink",
        className,
      )}
    >
      {label}
    </div>
  );
}

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-content-muted",
        className,
      )}
    >
      <span className="h-px w-5 bg-content-muted" />
      {children}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-14 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-content-muted">
          {icon}
        </div>
      )}
      <h3 className="font-display text-base font-bold text-content">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-content-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
