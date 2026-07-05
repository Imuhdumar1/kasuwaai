"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Receipt, CreditCard, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, Card, EmptyState, Select, StatusBadge } from "@/components/ui";
import { StatCard } from "@/components/stat-card";
import { PaymentForm, type PayableSale } from "@/components/payments/payment-form";
import { useI18n } from "@/components/providers";
import { formatMoney, relativeDueLabel } from "@/lib/format";
import { debtStatus } from "@/lib/calc";

export type DebtRow = {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  total_amount: number;
  amount_paid: number;
  outstanding_balance: number;
  status: "paid" | "partially_paid" | "unpaid";
  due_date: string | null;
};

export function DebtsView({ rows, currency }: { rows: DebtRow[]; currency: string }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<"all" | "overdue" | "scheduled" | "unpaid">("all");
  const [payFor, setPayFor] = useState<PayableSale | null>(null);

  const withStatus = useMemo(
    () => rows.map((r) => ({ ...r, derived: debtStatus(r) })),
    [rows],
  );

  const totalOutstanding = rows.reduce((a, r) => a + r.outstanding_balance, 0);
  const overdue = withStatus.filter((r) => r.derived === "overdue");
  const overdueAmount = overdue.reduce((a, r) => a + r.outstanding_balance, 0);

  const filtered = withStatus.filter((r) => {
    if (filter === "all") return true;
    if (filter === "overdue") return r.derived === "overdue";
    if (filter === "scheduled") return r.derived === "scheduled";
    if (filter === "unpaid") return r.status === "unpaid";
    return true;
  });

  return (
    <div className="animate-fade-up">
      <PageHeader title={t("nav.debts")} description={t("debt.subtitle")} />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label={t("dash.outstanding")} value={formatMoney(totalOutstanding, currency)} accent={totalOutstanding > 0 ? "danger" : "none"} />
        <StatCard label={t("dash.overdue")} value={String(overdue.length)} icon={<AlertTriangle className="h-4 w-4" />} accent={overdue.length ? "danger" : "none"} />
        <StatCard label="Overdue amount" value={formatMoney(overdueAmount, currency)} />
        <StatCard label="Open debts" value={String(rows.length)} />
      </div>

      <div className="mb-4 flex justify-end">
        <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="sm:w-48">
          <option value="all">{t("common.all")}</option>
          <option value="overdue">Overdue</option>
          <option value="scheduled">Scheduled</option>
          <option value="unpaid">Unpaid</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title={rows.length === 0 ? t("empty.debts.title") : "Nothing here"}
          description={rows.length === 0 ? t("empty.debts.desc") : "No debts match this filter."}
        />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {filtered.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/sales/${r.id}`} className="font-medium hover:underline">
                    {r.customer_name ?? t("sale.walkin")}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-content-muted">
                    <StatusBadge status={r.derived} />
                    {r.due_date && <span>· {relativeDueLabel(r.due_date)}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-content-muted">{t("debt.remaining")}</div>
                  <div className="font-semibold text-danger">{formatMoney(r.outstanding_balance, currency)}</div>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    setPayFor({
                      id: r.id,
                      label: r.customer_name ?? t("sale.walkin"),
                      outstanding_balance: r.outstanding_balance,
                    })
                  }
                >
                  <CreditCard className="h-4 w-4" /> {t("debt.settle")}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <PaymentForm open={!!payFor} onClose={() => setPayFor(null)} sale={payFor} currency={currency} />
    </div>
  );
}
