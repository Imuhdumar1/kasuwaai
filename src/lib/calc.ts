import type { DebtStatus, Payment, Sale, SaleItem } from "@/lib/types";
import { daysUntil } from "@/lib/format";

export type SaleForCalc = Sale & { sale_items?: SaleItem[]; customer?: { id: string; full_name: string } | null };

/* ─── Date range helpers (local time) ─────────────────────────────────── */
export function startOfToday(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
export function startOfWeek(d = new Date()): Date {
  const s = startOfToday(d);
  const day = (s.getDay() + 6) % 7; // Monday = 0
  s.setDate(s.getDate() - day);
  return s;
}
export function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function inRange(dateStr: string, from: Date): boolean {
  const t = new Date(dateStr).getTime();
  return t >= from.getTime();
}

/* ─── Debt status (adds time-based overdue/scheduled to the stored status) */
export function debtStatus(sale: Pick<Sale, "status" | "outstanding_balance" | "due_date">): DebtStatus {
  if (sale.status === "paid" || sale.outstanding_balance <= 0) return "paid";
  const days = daysUntil(sale.due_date);
  if (days !== null && days < 0) return "overdue";
  if (days !== null && days >= 0) return "scheduled";
  return sale.status; // unpaid / partially_paid with no due date
}

/** Time bucket of an open debt: overdue (past due), today, upcoming (future), or none (no due date). */
export function dueBucket(sale: Pick<Sale, "due_date">): "overdue" | "today" | "upcoming" | "none" {
  const days = daysUntil(sale.due_date);
  if (days === null) return "none";
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  return "upcoming";
}

export interface DashboardStats {
  todaySales: number;
  weekSales: number;
  monthSales: number;
  totalRevenue: number; // total value of all sales (billed)
  paymentsReceived: number; // actual cash collected
  outstandingDebt: number;
  overdueDebt: number;
  overdueCount: number;
  transactionCount: number;
  averageSale: number;
  totalProfit: number;
  paymentCompletionRate: number; // %
  healthScore: number; // 0..100
}

export function computeDashboard(sales: SaleForCalc[], payments: Payment[]): DashboardStats {
  const today = startOfToday();
  const week = startOfWeek();
  const month = startOfMonth();

  let todaySales = 0,
    weekSales = 0,
    monthSales = 0,
    totalRevenue = 0,
    outstandingDebt = 0,
    overdueDebt = 0,
    overdueCount = 0,
    totalProfit = 0,
    paidCount = 0;

  for (const s of sales) {
    totalRevenue += s.total_amount;
    totalProfit += s.profit;
    outstandingDebt += s.outstanding_balance;
    if (inRange(s.sale_date, today)) todaySales += s.total_amount;
    if (inRange(s.sale_date, week)) weekSales += s.total_amount;
    if (inRange(s.sale_date, month)) monthSales += s.total_amount;
    if (s.status === "paid") paidCount += 1;
    if (debtStatus(s) === "overdue") {
      overdueDebt += s.outstanding_balance;
      overdueCount += 1;
    }
  }

  const paymentsReceived = payments.reduce((a, p) => a + p.amount, 0);
  const transactionCount = sales.length;
  const averageSale = transactionCount ? totalRevenue / transactionCount : 0;
  const paymentCompletionRate = transactionCount ? (paidCount / transactionCount) * 100 : 0;

  return {
    todaySales,
    weekSales,
    monthSales,
    totalRevenue,
    paymentsReceived,
    outstandingDebt,
    overdueDebt,
    overdueCount,
    transactionCount,
    averageSale,
    totalProfit,
    paymentCompletionRate,
    healthScore: healthScore(sales, { totalRevenue, paymentsReceived, outstandingDebt, overdueDebt }),
  };
}

/** Composite 0–100 business health score. Returns 0 with no sales (new account). */
export function healthScore(
  sales: SaleForCalc[],
  totals: { totalRevenue: number; paymentsReceived: number; outstandingDebt: number; overdueDebt: number },
): number {
  if (sales.length === 0 || totals.totalRevenue <= 0) return 0;

  const collectionRate = clamp01(totals.paymentsReceived / totals.totalRevenue);
  const overdueRatio =
    totals.outstandingDebt > 0 ? clamp01(totals.overdueDebt / totals.outstandingDebt) : 0;

  const week = startOfWeek();
  const recentCount = sales.filter((s) => new Date(s.sale_date) >= week).length;
  const recency = clamp01(recentCount / 5);

  const score = 0.5 * collectionRate + 0.3 * (1 - overdueRatio) + 0.2 * recency;
  return Math.round(score * 100);
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/* ─── Aggregations for dashboard widgets ──────────────────────────────── */
export function topCustomers(sales: SaleForCalc[], limit = 5) {
  const map = new Map<string, { name: string; total: number; outstanding: number; count: number }>();
  for (const s of sales) {
    if (!s.customer) continue;
    const cur = map.get(s.customer.id) ?? { name: s.customer.full_name, total: 0, outstanding: 0, count: 0 };
    cur.total += s.total_amount;
    cur.outstanding += s.outstanding_balance;
    cur.count += 1;
    map.set(s.customer.id, cur);
  }
  return Array.from(map.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function bestProducts(sales: SaleForCalc[], limit = 5) {
  const map = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const s of sales) {
    for (const it of s.sale_items ?? []) {
      const key = it.product_id ?? it.product_name;
      const cur = map.get(key) ?? { name: it.product_name, qty: 0, revenue: 0 };
      cur.qty += it.quantity;
      cur.revenue += it.line_total;
      map.set(key, cur);
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/** Local YYYY-MM-DD key (avoids the UTC off-by-one that toISOString causes). */
function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Daily totals for the last `days` days — for the sales trend chart. */
export function salesTrend(sales: SaleForCalc[], days = 7) {
  const buckets: { date: string; sales: number; payments: number }[] = [];
  const today = startOfToday();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({ date: localDayKey(d), sales: 0, payments: 0 });
  }
  const index = new Map(buckets.map((b, i) => [b.date, i]));
  for (const s of sales) {
    const key = localDayKey(new Date(s.sale_date));
    const i = index.get(key);
    if (i !== undefined) buckets[i].sales += s.total_amount;
  }
  return buckets;
}

/** Simple rule-based recommendations from real figures (no AI keys). */
export function recommendations(stats: DashboardStats, sales: SaleForCalc[]): string[] {
  const recs: string[] = [];
  if (sales.length === 0) {
    recs.push("Record your first sale to start seeing insights about your business.");
    return recs;
  }
  if (stats.overdueCount > 0) {
    recs.push(
      `You have ${stats.overdueCount} overdue debt${stats.overdueCount === 1 ? "" : "s"}. Follow up with these customers to recover your money.`,
    );
  }
  if (stats.paymentCompletionRate < 60) {
    recs.push("Less than 60% of your sales are fully paid. Consider collecting a deposit before giving credit.");
  }
  if (stats.todaySales === 0) {
    recs.push("No sales recorded today yet. Keep your records up to date for accurate reports.");
  }
  if (stats.totalProfit > 0 && stats.totalRevenue > 0) {
    const margin = Math.round((stats.totalProfit / stats.totalRevenue) * 100);
    recs.push(`Your average profit margin is about ${margin}%. Watch product costs to protect it.`);
  }
  if (recs.length === 0) recs.push("Your business is healthy — keep recording every sale and payment.");
  return recs.slice(0, 4);
}
