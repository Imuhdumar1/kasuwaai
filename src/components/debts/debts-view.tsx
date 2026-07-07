"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Receipt, CreditCard, AlertTriangle, Bell, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge, Button, Card, EmptyState, Select, Spinner } from "@/components/ui";
import { StatCard } from "@/components/stat-card";
import { PaymentForm, type PayableSale } from "@/components/payments/payment-form";
import { ReminderDialog, type ReminderTarget } from "@/components/debts/reminder-dialog";
import { useI18n } from "@/components/providers";
import { formatMoney, relativeDueLabel } from "@/lib/format";
import { dueBucket } from "@/lib/calc";
import { recordPayment } from "@/app/(app)/payments/actions";
import type { DueBucket } from "@/lib/reminders";

export type DebtRow = {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  total_amount: number;
  amount_paid: number;
  outstanding_balance: number;
  status: "paid" | "partially_paid" | "unpaid";
  due_date: string | null;
};

const BUCKET_META: Record<DueBucket, { tone: "danger" | "warning" | "info" | "neutral"; label: string }> = {
  overdue: { tone: "danger", label: "Overdue" },
  today: { tone: "warning", label: "Due today" },
  upcoming: { tone: "info", label: "Upcoming" },
  none: { tone: "neutral", label: "No due date" },
};

export function DebtsView({
  rows,
  currency,
  businessName,
}: {
  rows: DebtRow[];
  currency: string;
  businessName: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | DueBucket>("all");
  const [payFor, setPayFor] = useState<PayableSale | null>(null);
  const [remindFor, setRemindFor] = useState<ReminderTarget | null>(null);

  // One-click: record a payment for the full outstanding balance (debt fully paid).
  function settleInFull(r: DebtRow) {
    const msg = t("debt.confirmSettle", { amount: formatMoney(r.outstanding_balance, currency) });
    if (!confirm(msg)) return;
    setSettlingId(r.id);
    start(async () => {
      const res = await recordPayment({
        sale_id: r.id,
        amount: r.outstanding_balance,
        method: "Cash",
        reference_number: null,
        payment_date: new Date().toISOString(),
        notes: "Settled in full",
      });
      setSettlingId(null);
      if (res.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  const withBucket = useMemo(() => rows.map((r) => ({ ...r, bucket: dueBucket(r) })), [rows]);

  const totalOutstanding = rows.reduce((a, r) => a + r.outstanding_balance, 0);
  const overdue = withBucket.filter((r) => r.bucket === "overdue");
  const dueToday = withBucket.filter((r) => r.bucket === "today");
  const overdueAmount = overdue.reduce((a, r) => a + r.outstanding_balance, 0);

  const filtered = withBucket.filter((r) => (filter === "all" ? true : r.bucket === filter));

  return (
    <div className="animate-fade-up">
      <PageHeader title={t("nav.debts")} description={t("debt.subtitle")} />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label={t("dash.outstanding")} value={formatMoney(totalOutstanding, currency)} accent={totalOutstanding > 0 ? "danger" : "none"} />
        <StatCard label={t("dash.overdue")} value={String(overdue.length)} icon={<AlertTriangle className="h-4 w-4" />} accent={overdue.length ? "danger" : "none"} sub={overdueAmount > 0 ? formatMoney(overdueAmount, currency) : undefined} />
        <StatCard label="Due today" value={String(dueToday.length)} accent={dueToday.length ? "warning" : "none"} />
        <StatCard label="Open debts" value={String(rows.length)} />
      </div>

      <div className="mb-4 flex justify-end">
        <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="sm:w-48">
          <option value="all">{t("common.all")}</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due today</option>
          <option value="upcoming">Upcoming</option>
          <option value="none">No due date</option>
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
            {filtered.map((r) => {
              const meta = BUCKET_META[r.bucket];
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <Link href={`/sales/${r.id}`} className="font-medium hover:underline">
                      {r.customer_name ?? t("sale.walkin")}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-content-muted">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      {r.due_date && <span>· {relativeDueLabel(r.due_date)}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-content-muted">{t("debt.remaining")}</div>
                    <div className="font-semibold text-danger">{formatMoney(r.outstanding_balance, currency)}</div>
                  </div>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() =>
                        setRemindFor({
                          customerName: r.customer_name ?? "",
                          phone: r.phone,
                          whatsapp: r.whatsapp,
                          amount: r.outstanding_balance,
                          dueDate: r.due_date,
                          bucket: r.bucket,
                        })
                      }
                    >
                      <Bell className="h-4 w-4" /> {t("debt.remind")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
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
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-none"
                      disabled={pending && settlingId === r.id}
                      onClick={() => settleInFull(r)}
                    >
                      {pending && settlingId === r.id ? <Spinner /> : <CheckCircle2 className="h-4 w-4" />} {t("debt.settleFull")}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <PaymentForm open={!!payFor} onClose={() => setPayFor(null)} sale={payFor} currency={currency} />
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
