"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, Card, EmptyState, Input } from "@/components/ui";
import { StatCard } from "@/components/stat-card";
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

export function PaymentsView({ rows, currency }: { rows: PaymentRow[]; currency: string }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  const total = rows.reduce((a, r) => a + r.amount, 0);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => (r.customer_name ?? "").toLowerCase().includes(q) || (r.method ?? "").toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={t("nav.payments")}
        description={t("pay.subtitle")}
        actions={
          <Link href="/debts">
            <Button>
              <CreditCard className="h-4 w-4" /> {t("pay.record")}
            </Button>
          </Link>
        }
      />

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
          action={
            rows.length === 0 ? (
              <Link href="/debts">
                <Button>{t("pay.record")}</Button>
              </Link>
            ) : undefined
          }
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
    </div>
  );
}
