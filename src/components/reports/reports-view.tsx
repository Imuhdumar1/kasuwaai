"use client";

import { useMemo, useState } from "react";
import { Download, Printer, FileDown } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, Card, Select } from "@/components/ui";
import { StatCard } from "@/components/stat-card";
import { useI18n } from "@/components/providers";
import { formatMoney, formatDate } from "@/lib/format";
import { downloadCSV, downloadCsvSections } from "@/lib/csv";
import { startOfToday, startOfWeek, startOfMonth } from "@/lib/calc";

export type ReportSale = {
  id: string;
  sale_date: string;
  customer_name: string | null;
  total_amount: number;
  amount_paid: number;
  outstanding_balance: number;
  status: string;
  due_date: string | null;
  profit: number;
  items: { product_name: string; quantity: number; line_total: number; cost_price: number }[];
};
export type ReportPayment = {
  id: string;
  payment_date: string;
  customer_name: string | null;
  amount: number;
  method: string | null;
  reference_number: string | null;
};

type ReportType =
  | "sales"
  | "revenue"
  | "profit"
  | "debts"
  | "payments"
  | "products"
  | "customers"
  | "summary";
type Range = "today" | "week" | "month" | "year" | "all";
type ReportResult = { headers: string[]; rows: (string | number)[][]; summary: { label: string; value: string }[] };
type Row = (string | number)[];

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "sales", label: "Sales report" },
  { value: "revenue", label: "Revenue report" },
  { value: "profit", label: "Profit report" },
  { value: "debts", label: "Debt report" },
  { value: "payments", label: "Payment report" },
  { value: "products", label: "Product report" },
  { value: "customers", label: "Customer report" },
  { value: "summary", label: "Business summary" },
];

const MONEY_COLS: Record<ReportType, number[]> = {
  sales: [2, 3, 4],
  revenue: [2, 3],
  profit: [2, 3, 4],
  debts: [2, 3, 4],
  payments: [2],
  products: [2, 3],
  customers: [2, 3],
  summary: [],
};

function computeReport(type: ReportType, fSales: ReportSale[], fPayments: ReportPayment[], currency: string): ReportResult {
  const money = (n: number) => formatMoney(n, currency);
  switch (type) {
    case "sales": {
      const headers = ["Date", "Customer", "Total", "Paid", "Balance", "Status"];
      const rows = fSales.map((s) => [formatDate(s.sale_date), s.customer_name ?? "Walk-in", s.total_amount, s.amount_paid, s.outstanding_balance, s.status]);
      const total = fSales.reduce((a, s) => a + s.total_amount, 0);
      const profit = fSales.reduce((a, s) => a + s.profit, 0);
      return { headers, rows, summary: [{ label: "Transactions", value: String(fSales.length) }, { label: "Total sales", value: money(total) }, { label: "Profit", value: money(profit) }] };
    }
    case "revenue": {
      const dayKey = (d: string) => {
        const x = new Date(d);
        return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
      };
      const byDay = new Map<string, { count: number; revenue: number; profit: number }>();
      for (const s of fSales) {
        const k = dayKey(s.sale_date);
        const cur = byDay.get(k) ?? { count: 0, revenue: 0, profit: 0 };
        cur.count += 1;
        cur.revenue += s.total_amount;
        cur.profit += s.profit;
        byDay.set(k, cur);
      }
      const entries = Array.from(byDay.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      const headers = ["Date", "Transactions", "Revenue", "Profit"];
      const rows = entries.map(([k, v]) => [formatDate(k), v.count, v.revenue, v.profit]);
      const totalRev = fSales.reduce((a, s) => a + s.total_amount, 0);
      const totalProfit = fSales.reduce((a, s) => a + s.profit, 0);
      return { headers, rows, summary: [{ label: "Total revenue", value: money(totalRev) }, { label: "Total profit", value: money(totalProfit) }] };
    }
    case "profit": {
      const map = new Map<string, { qty: number; revenue: number; cost: number }>();
      for (const s of fSales)
        for (const it of s.items) {
          const cur = map.get(it.product_name) ?? { qty: 0, revenue: 0, cost: 0 };
          cur.qty += it.quantity;
          cur.revenue += it.line_total;
          cur.cost += it.cost_price * it.quantity;
          map.set(it.product_name, cur);
        }
      const entries = Array.from(map.entries()).sort((a, b) => b[1].revenue - b[1].cost - (a[1].revenue - a[1].cost));
      const headers = ["Product", "Qty sold", "Revenue", "Cost", "Profit"];
      const rows = entries.map(([n, v]) => [n, v.qty, v.revenue, v.cost, v.revenue - v.cost]);
      const totalProfit = entries.reduce((a, [, v]) => a + (v.revenue - v.cost), 0);
      const totalRev = entries.reduce((a, [, v]) => a + v.revenue, 0);
      const margin = totalRev > 0 ? Math.round((totalProfit / totalRev) * 100) : 0;
      return { headers, rows, summary: [{ label: "Total profit", value: money(totalProfit) }, { label: "Avg margin", value: `${margin}%` }] };
    }
    case "debts": {
      const debts = fSales.filter((s) => s.outstanding_balance > 0);
      const headers = ["Date", "Customer", "Total", "Paid", "Remaining", "Due", "Status"];
      const rows = debts.map((s) => [formatDate(s.sale_date), s.customer_name ?? "Walk-in", s.total_amount, s.amount_paid, s.outstanding_balance, s.due_date ? formatDate(s.due_date) : "—", s.status]);
      const owed = debts.reduce((a, s) => a + s.outstanding_balance, 0);
      return { headers, rows, summary: [{ label: "Open debts", value: String(debts.length) }, { label: "Total owed", value: money(owed) }] };
    }
    case "payments": {
      const headers = ["Date", "Customer", "Amount", "Method", "Reference"];
      const rows = fPayments.map((p) => [formatDate(p.payment_date), p.customer_name ?? "—", p.amount, p.method ?? "Cash", p.reference_number ?? "—"]);
      const total = fPayments.reduce((a, p) => a + p.amount, 0);
      return { headers, rows, summary: [{ label: "Payments", value: String(fPayments.length) }, { label: "Total received", value: money(total) }] };
    }
    case "products": {
      const map = new Map<string, { qty: number; revenue: number; cost: number }>();
      for (const s of fSales)
        for (const it of s.items) {
          const cur = map.get(it.product_name) ?? { qty: 0, revenue: 0, cost: 0 };
          cur.qty += it.quantity;
          cur.revenue += it.line_total;
          cur.cost += it.cost_price * it.quantity;
          map.set(it.product_name, cur);
        }
      const entries = Array.from(map.entries()).sort((a, b) => b[1].revenue - a[1].revenue);
      const headers = ["Product", "Qty sold", "Revenue", "Profit"];
      const rows = entries.map(([n, v]) => [n, v.qty, v.revenue, v.revenue - v.cost]);
      return { headers, rows, summary: [{ label: "Products sold", value: String(entries.length) }] };
    }
    case "customers": {
      const map = new Map<string, { count: number; spent: number; owing: number }>();
      for (const s of fSales) {
        const key = s.customer_name ?? "Walk-in";
        const cur = map.get(key) ?? { count: 0, spent: 0, owing: 0 };
        cur.count += 1;
        cur.spent += s.total_amount;
        cur.owing += s.outstanding_balance;
        map.set(key, cur);
      }
      const entries = Array.from(map.entries()).sort((a, b) => b[1].spent - a[1].spent);
      const headers = ["Customer", "Transactions", "Total spent", "Owing"];
      const rows = entries.map(([n, v]) => [n, v.count, v.spent, v.owing]);
      return { headers, rows, summary: [{ label: "Customers", value: String(entries.length) }] };
    }
    case "summary": {
      const totalRev = fSales.reduce((a, s) => a + s.total_amount, 0);
      const totalProfit = fSales.reduce((a, s) => a + s.profit, 0);
      const paid = fPayments.reduce((a, p) => a + p.amount, 0);
      const outstanding = fSales.reduce((a, s) => a + s.outstanding_balance, 0);
      const openDebts = fSales.filter((s) => s.outstanding_balance > 0).length;
      const custs = new Set(fSales.map((s) => s.customer_name ?? "Walk-in")).size;
      const avg = fSales.length ? totalRev / fSales.length : 0;
      const margin = totalRev > 0 ? Math.round((totalProfit / totalRev) * 100) : 0;
      const headers = ["Metric", "Value"];
      const rows: Row[] = [
        ["Transactions", String(fSales.length)],
        ["Total sales", money(totalRev)],
        ["Total profit", money(totalProfit)],
        ["Profit margin", `${margin}%`],
        ["Payments received", money(paid)],
        ["Outstanding debt", money(outstanding)],
        ["Open debts", String(openDebts)],
        ["Average sale", money(avg)],
        ["Customers", String(custs)],
      ];
      return { headers, rows, summary: [{ label: "Total sales", value: money(totalRev) }, { label: "Total profit", value: money(totalProfit) }, { label: "Outstanding", value: money(outstanding) }] };
    }
  }
}

/** Format money columns for export files (numbers → "₦…"). */
function exportRows(type: ReportType, rows: Row[], currency: string): Row[] {
  const cols = MONEY_COLS[type];
  if (!cols.length) return rows;
  return rows.map((r) => r.map((cell, i) => (cols.includes(i) ? formatMoney(Number(cell), currency) : cell)));
}

export function ReportsView({
  sales,
  payments,
  currency,
  businessName,
}: {
  sales: ReportSale[];
  payments: ReportPayment[];
  currency: string;
  businessName: string;
}) {
  const { t } = useI18n();
  const [type, setType] = useState<ReportType>("sales");
  const [range, setRange] = useState<Range>("month");

  const from = useMemo(() => {
    if (range === "today") return startOfToday();
    if (range === "week") return startOfWeek();
    if (range === "month") return startOfMonth();
    if (range === "year") return new Date(new Date().getFullYear(), 0, 1);
    return new Date(0);
  }, [range]);

  const inRange = (d: string) => new Date(d).getTime() >= from.getTime();
  const fSales = useMemo(() => sales.filter((s) => inRange(s.sale_date)), [sales, from]);
  const fPayments = useMemo(() => payments.filter((p) => inRange(p.payment_date)), [payments, from]);

  const money = (n: number) => formatMoney(n, currency);
  const report = useMemo(() => computeReport(type, fSales, fPayments, currency), [type, fSales, fPayments, currency]);

  const fileBase = `${businessName}-${type}-${range}`;
  const reportTitle = `${businessName} — ${type} report (${range})`;

  function exportCsv() {
    downloadCSV(fileBase, report.headers, exportRows(type, report.rows, currency));
  }
  async function exportPdf() {
    const { downloadPdf } = await import("@/lib/export");
    downloadPdf(fileBase, reportTitle, report.headers, exportRows(type, report.rows, currency));
  }
  async function exportWord() {
    const { downloadWord } = await import("@/lib/export");
    downloadWord(fileBase, reportTitle, report.headers, exportRows(type, report.rows, currency));
  }

  const allSections = () =>
    REPORT_TYPES.map((rt) => {
      const r = computeReport(rt.value, fSales, fPayments, currency);
      return { title: rt.label, headers: r.headers, rows: exportRows(rt.value, r.rows, currency) };
    });
  const allFile = `${businessName}-all-reports-${range}`;
  const allTitle = `${businessName} — All reports (${range})`;

  function exportAllCsv() {
    downloadCsvSections(allFile, allSections());
  }
  async function exportAllPdf() {
    const { downloadPdfSections } = await import("@/lib/export");
    downloadPdfSections(allFile, allTitle, allSections());
  }
  async function exportAllWord() {
    const { downloadWordSections } = await import("@/lib/export");
    downloadWordSections(allFile, allTitle, allSections());
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={t("nav.reports")}
        description="Generate reports from your real data and export them."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportWord}>
              <Download className="h-4 w-4" /> Word
            </Button>
            <Button size="sm" onClick={exportPdf}>
              <Download className="h-4 w-4" /> PDF
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Select value={type} onChange={(e) => setType(e.target.value as ReportType)} className="sm:w-56">
          {REPORT_TYPES.map((rt) => (
            <option key={rt.value} value={rt.value}>
              {rt.label}
            </option>
          ))}
        </Select>
        <Select value={range} onChange={(e) => setRange(e.target.value as Range)} className="sm:w-44">
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
          <option value="all">All time</option>
        </Select>
      </div>

      {/* Download every report in one file */}
      <Card className="mb-4 flex flex-col gap-3 border-lime/40 bg-lime/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <FileDown className="h-4 w-4 text-lime-dark" />
          <span className="font-medium">Download all {REPORT_TYPES.length} reports in one file</span>
          <span className="hidden text-content-muted sm:inline">({range})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportAllCsv}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportAllWord}>
            <Download className="h-4 w-4" /> Word
          </Button>
          <Button size="sm" onClick={exportAllPdf}>
            <Download className="h-4 w-4" /> PDF
          </Button>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {report.summary.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <Card className="overflow-hidden">
        {report.rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-content-muted">No data for this report and date range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase text-content-muted">
                  {report.headers.map((h, i) => (
                    <th key={h} className={`p-3 font-medium ${MONEY_COLS[type].includes(i) ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {report.rows.map((r, ri) => (
                  <tr key={ri} className="hover:bg-surface-2">
                    {r.map((cell, ci) => (
                      <td key={ci} className={`p-3 ${MONEY_COLS[type].includes(ci) ? "text-right font-medium" : ""}`}>
                        {MONEY_COLS[type].includes(ci) ? money(Number(cell)) : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
