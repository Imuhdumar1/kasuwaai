const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GHS: "GH₵",
  KES: "KSh",
  ZAR: "R",
  EUR: "€",
  GBP: "£",
};

export function currencySymbol(currency = "NGN"): string {
  return CURRENCY_SYMBOLS[currency] ?? currency + " ";
}

/** Format a money amount with the business currency symbol and grouped thousands. */
export function formatMoney(amount: number | null | undefined, currency = "NGN"): string {
  const n = Number(amount ?? 0);
  const sym = currencySymbol(currency);
  const formatted = n.toLocaleString("en-NG", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${sym}${formatted}`;
}

/** Compact money for chart axes / tight spaces (e.g. ₦1.8M). */
export function formatMoneyCompact(amount: number | null | undefined, currency = "NGN"): string {
  const n = Number(amount ?? 0);
  const sym = currencySymbol(currency);
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (abs >= 1_000) return `${sym}${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${sym}${n}`;
}

export function formatNumber(n: number | null | undefined): string {
  return Number(n ?? 0).toLocaleString("en-NG");
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days from today until `due` (negative = overdue). */
export function daysUntil(due: string | Date | null | undefined): number | null {
  if (!due) return null;
  const d = new Date(due);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const b = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((a - b) / DAY_MS);
}

export function relativeDueLabel(due: string | Date | null | undefined): string {
  const days = daysUntil(due);
  if (days === null) return "No due date";
  if (days === 0) return "Due today";
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} left`;
  return `${Math.abs(days)} day${days === -1 ? "" : "s"} overdue`;
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
