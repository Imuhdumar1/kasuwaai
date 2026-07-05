import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  sub,
  accent,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  sub?: string;
  accent?: "lime" | "danger" | "success" | "info" | "none";
}) {
  const accentRing =
    accent === "lime"
      ? "before:bg-lime"
      : accent === "danger"
        ? "before:bg-danger"
        : accent === "success"
          ? "before:bg-success"
          : accent === "info"
            ? "before:bg-info"
            : "before:bg-transparent";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5",
        "before:absolute before:left-0 before:top-0 before:h-full before:w-1",
        accentRing,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 text-[11px] font-medium uppercase leading-tight tracking-wide text-content-muted sm:text-xs">
          {label}
        </span>
        {icon && <span className="shrink-0 text-content-muted">{icon}</span>}
      </div>
      <div className="mt-2 truncate font-display text-lg font-extrabold tracking-tight tabular-nums sm:text-xl lg:text-2xl">
        {value}
      </div>
      {sub && <div className="mt-1 truncate text-xs text-content-muted">{sub}</div>}
    </div>
  );
}
