"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, Card, EmptyState, Input } from "@/components/ui";
import { StatCard } from "@/components/stat-card";
import { Modal } from "@/components/modal";
import { PaymentForm, type PayableSale } from "@/components/payments/payment-form";
import { useI18n } from "@/components/providers";
import { formatMoney, formatDate } from "@/lib/format";

export type PaymentRow = {
  id: string;
  amount: number;
  method: string | null;
  reference_number: string | null;
  payment_date: string;
  customer_name: string | null;
  sale_id: string;
};

export type OpenDebt = {
  id: string;
  customer_name: string | null;
  outstanding_balance: number;
};

export function PaymentsView({
  rows,
  openDebts,
  currency,
}: {
  rows: PaymentRow[];
  openDebts: OpenDebt[];
  currency: string;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickQuery, setPickQuery] = useState("");
  const [payFor, setPayFor] = useState<PayableSale | null>(null);

  const total = rows.reduce((a, r) => a + r.amount, 0);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => (r.customer_name ?? "").toLowerCase().includes(q) || (r.method ?? "").toLowerCase().includes(q),
    );
  }, [rows, query]);

  const pickable = useMemo(() => {
    const q = pickQuery.trim().toLowerCase();
    if (!q) return openDebts;
    return openDebts.filter((d) => (d.customer_name ?? "").toLowerCase().includes(q));
  }, [openDebts, pickQuery]);

  function choose(d: OpenDebt) {
    setPayFor({
      id: d.id,
      label: d.customer_name ?? t("sale.walkin"),
      outstanding_balance: d.outstanding_balance,
    });
    setPickerOpen(false);
  }

  const recordBtn = (
    <Button onClick={() => setPickerOpen(true)}>
      <CreditCard className="h-4 w-4" /> {t("pay.record")}
    </Button>
  );

  return (
    <div className="animate-fade-up">
      <PageHeader title={t("nav.payments")} description={t("pay.subtitle")} actions={recordBtn} />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label={t("dash.payments")} value={formatMoney(total, currency)} accent="success" />
        <StatCard label="Payments" value={String(rows.length)} />
      </div>

      <div className="mb-4 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`${t("common.search")}…`} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-6 w-6" />}
          title={rows.length === 0 ? "No payments yet" : "No matches"}
          description={
            rows.length === 0 ? "Payments you record against debts will appear here." : "Try a different search."
          }
          action={rows.length === 0 ? recordBtn : undefined}
        />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {filtered.map((r) => (
              <li key={r.id} className="flex items-center gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <CreditCard className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={`/sales/${r.sale_id}`} className="truncate font-medium hover:underline">
                    {r.customer_name ?? t("sale.walkin")}
                  </Link>
                  <div className="text-xs text-content-muted">
                    {r.method || "Cash"}
                    {r.reference_number ? ` · ${r.reference_number}` : ""} · {formatDate(r.payment_date)}
                  </div>
                </div>
                <div className="font-semibold text-success">+{formatMoney(r.amount, currency)}</div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Pick which open debt to record a payment against — no navigation away. */}
      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title={t("pay.record")} description={t("pay.pickDebt")} size="sm">
        {openDebts.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="h-6 w-6" />}
            title={t("pay.noOpenDebts")}
            description={t("pay.noOpenDebtsDesc")}
          />
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
              <Input value={pickQuery} onChange={(e) => setPickQuery(e.target.value)} placeholder={t("cust.search")} className="pl-9" autoFocus />
            </div>
            <ul className="max-h-72 divide-y divide-line overflow-y-auto rounded-xl border border-line">
              {pickable.length === 0 ? (
                <li className="p-4 text-center text-sm text-content-muted">No matches</li>
              ) : (
                pickable.map((d) => (
                  <li key={d.id}>
                    <button
                      onClick={() => choose(d)}
                      className="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-surface-2"
                    >
                      <span className="min-w-0 truncate font-medium">{d.customer_name ?? t("sale.walkin")}</span>
                      <span className="shrink-0 font-semibold text-danger">{formatMoney(d.outstanding_balance, currency)}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </Modal>

      <PaymentForm open={!!payFor} onClose={() => setPayFor(null)} sale={payFor} currency={currency} />
    </div>
  );
}
