"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  Wallet,
  Users,
  Package,
  Receipt,
  CreditCard,
  ShoppingCart,
  Sparkles,
  ArrowUpRight,
  Bell,
} from "lucide-react";
import { useI18n } from "@/components/providers";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { Badge, Button, Card, StatusBadge } from "@/components/ui";
import { ReminderDialog, type ReminderTarget } from "@/components/debts/reminder-dialog";
import { formatMoney, formatMoneyCompact, formatNumber, formatDate, relativeDueLabel } from "@/lib/format";
import type { DashboardStats } from "@/lib/calc";

type TrendPoint = { date: string; sales: number; payments: number };
type TopCustomer = { id: string; name: string; total: number; outstanding: number; count: number };
type BestProduct = { name: string; qty: number; revenue: number };
type RecentItem = {
  id: string;
  kind: "sale" | "payment";
  name: string;
  amount: number;
  date: string;
  status?: string;
};
type AttentionItem = {
  id: string;
  customerName: string;
  phone: string | null;
  whatsapp: string | null;
  amount: number;
  dueDate: string | null;
  bucket: "overdue" | "today";
};

export function DashboardView({
  businessName,
  currency,
  stats,
  trend,
  topCustomers,
  bestProducts,
  recommendations,
  recent,
  attention,
  counts,
}: {
  businessName: string;
  currency: string;
  stats: DashboardStats;
  trend: TrendPoint[];
  topCustomers: TopCustomer[];
  bestProducts: BestProduct[];
  recommendations: string[];
  recent: RecentItem[];
  attention: AttentionItem[];
  counts: { customers: number; products: number };
}) {
  const { t } = useI18n();
  const money = (n: number) => formatMoney(n, currency);
  const [remindFor, setRemindFor] = useState<ReminderTarget | null>(null);

  return (
    <div className="animate-fade-up">
      <PageHeader title={t("dash.title")} description={businessName} />

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label={t("dash.todaySales")} value={money(stats.todaySales)} icon={<ShoppingCart className="h-4 w-4" />} accent="lime" />
        <StatCard label={t("dash.weekSales")} value={money(stats.weekSales)} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label={t("dash.monthSales")} value={money(stats.monthSales)} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label={t("dash.revenue")} value={money(stats.totalRevenue)} icon={<Wallet className="h-4 w-4" />} />
        <StatCard
          label={t("dash.outstanding")}
          value={money(stats.outstandingDebt)}
          icon={<Receipt className="h-4 w-4" />}
          accent={stats.outstandingDebt > 0 ? "danger" : "none"}
          sub={stats.overdueCount > 0 ? `${stats.overdueCount} overdue` : undefined}
        />
        <StatCard label={t("dash.payments")} value={money(stats.paymentsReceived)} icon={<CreditCard className="h-4 w-4" />} accent="success" />
        <StatCard label={t("dash.customers")} value={formatNumber(counts.customers)} icon={<Users className="h-4 w-4" />} />
        <StatCard label={t("dash.products")} value={formatNumber(counts.products)} icon={<Package className="h-4 w-4" />} />
      </div>

      {/* Needs attention: overdue + due-today debts with reminders */}
      {attention.length > 0 && (
        <Card className="mt-4 border-danger/30">
          <div className="flex items-center gap-2 border-b border-line p-5">
            <Bell className="h-4 w-4 text-danger" />
            <h3 className="font-display font-bold">Needs attention</h3>
            <Badge tone="danger">{attention.length}</Badge>
            <Link href="/debts" className="ml-auto text-xs text-content-muted hover:text-content">
              {t("common.viewAll")}
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {attention.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/sales/${a.id}`} className="font-medium hover:underline">
                    {a.customerName}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                    <Badge tone={a.bucket === "overdue" ? "danger" : "warning"}>
                      {a.bucket === "overdue" ? "Overdue" : "Due today"}
                    </Badge>
                    {a.dueDate && <span className="text-content-muted">· {relativeDueLabel(a.dueDate)}</span>}
                  </div>
                </div>
                <div className="text-right font-semibold text-danger">{money(a.amount)}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRemindFor({
                      customerName: a.customerName,
                      phone: a.phone,
                      whatsapp: a.whatsapp,
                      amount: a.amount,
                      dueDate: a.dueDate,
                      bucket: a.bucket,
                    })
                  }
                >
                  <Bell className="h-4 w-4" /> Remind
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Chart + health */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-0">
            <h3 className="font-display font-bold">{t("dash.salesTrend")}</h3>
            <Badge tone="neutral">7 days</Badge>
          </div>
          <div className="h-64 w-full p-2 pt-4">
            {stats.transactionCount === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-content-muted">
                {t("dash.noActivity")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c8f23a" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#c8f23a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => formatDate(d).slice(0, 6)}
                    tick={{ fontSize: 11, fill: "#9a948c" }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={20}
                  />
                  <YAxis
                    tickFormatter={(v) => formatMoneyCompact(v, currency)}
                    tick={{ fontSize: 11, fill: "#9a948c" }}
                    axisLine={false}
                    tickLine={false}
                    width={54}
                  />
                  <Tooltip
                    formatter={(v) => [money(Number(v)), t("nav.sales")]}
                    labelFormatter={(d) => formatDate(d as string)}
                    contentStyle={{ borderRadius: 12, border: "1px solid rgba(10,10,10,0.1)", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#0a0a0a" strokeWidth={2} fill="url(#salesFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Health score */}
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <h3 className="mb-4 font-display font-bold">{t("dash.health")}</h3>
          <HealthRing score={stats.healthScore} />
          <p className="mt-4 text-sm text-content-muted">
            {stats.healthScore === 0
              ? t("dash.noActivity")
              : `${Math.round(stats.paymentCompletionRate)}% of sales fully paid`}
          </p>
        </Card>
      </div>

      {/* Lists row */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Recent activity */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between border-b border-line p-5">
            <h3 className="font-display font-bold">{t("dash.recent")}</h3>
          </div>
          {recent.length === 0 ? (
            <p className="p-6 text-sm text-content-muted">{t("dash.noActivity")}</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((r) => (
                <li key={`${r.kind}-${r.id}`} className="flex items-center gap-3 p-4">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      r.kind === "sale" ? "bg-lime/20 text-ink" : "bg-success/15 text-success"
                    }`}
                  >
                    {r.kind === "sale" ? <ShoppingCart className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-content-muted">{formatDate(r.date)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{money(r.amount)}</div>
                    {r.status && <StatusBadge status={r.status} />}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Top customers */}
        <Card>
          <div className="flex items-center justify-between border-b border-line p-5">
            <h3 className="font-display font-bold">{t("dash.topCustomers")}</h3>
            <Link href="/customers" className="text-xs text-content-muted hover:text-content">
              {t("common.viewAll")}
            </Link>
          </div>
          {topCustomers.length === 0 ? (
            <p className="p-6 text-sm text-content-muted">{t("empty.customers.desc")}</p>
          ) : (
            <ul className="divide-y divide-line">
              {topCustomers.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3 p-4">
                  <span className="font-display text-sm font-bold text-content-muted">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-content-muted">{c.count} sales</div>
                  </div>
                  <div className="text-sm font-semibold">{money(c.total)}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Best products */}
        <Card>
          <div className="flex items-center justify-between border-b border-line p-5">
            <h3 className="font-display font-bold">{t("dash.bestProducts")}</h3>
            <Link href="/products" className="text-xs text-content-muted hover:text-content">
              {t("common.viewAll")}
            </Link>
          </div>
          {bestProducts.length === 0 ? (
            <p className="p-6 text-sm text-content-muted">{t("empty.products.desc")}</p>
          ) : (
            <ul className="divide-y divide-line">
              {bestProducts.map((p, i) => (
                <li key={p.name + i} className="flex items-center gap-3 p-4">
                  <span className="font-display text-sm font-bold text-content-muted">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-content-muted">{formatNumber(p.qty)} sold</div>
                  </div>
                  <div className="text-sm font-semibold">{money(p.revenue)}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* AI recommendations */}
      <Card className="mt-4 border-lime/40 bg-lime/[0.06]">
        <div className="flex items-center gap-2 border-b border-line p-5">
          <Sparkles className="h-4 w-4 text-lime-dark" />
          <h3 className="font-display font-bold">{t("dash.recommendations")}</h3>
        </div>
        <ul className="space-y-3 p-5">
          {recommendations.map((r, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-lime-dark" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Card>

      <ReminderDialog
        open={!!remindFor}
        onClose={() => setRemindFor(null)}
        target={remindFor}
        businessName={businessName}
        currency={currency}
      />
    </div>
  );
}

function HealthRing({ score }: { score: number }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(100, score)) / 100);
  const color = score >= 70 ? "#16a34a" : score >= 40 ? "#d97706" : score > 0 ? "#dc2626" : "#c8c4bc";
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-extrabold tracking-tight tabular-nums">{score}%</span>
      </div>
    </div>
  );
}
