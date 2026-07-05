"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Plus, Mic } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, EmptyState, Input, Select, StatusBadge } from "@/components/ui";
import { useI18n } from "@/components/providers";
import { formatMoney, formatDate } from "@/lib/format";

export type SaleRow = {
  id: string;
  sale_date: string;
  customer_name: string | null;
  total_amount: number;
  amount_paid: number;
  outstanding_balance: number;
  status: string;
};

export function SalesView({ rows, currency }: { rows: SaleRow[]; currency: string }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "paid" | "partially_paid" | "unpaid">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      return (r.customer_name ?? "walk-in").toLowerCase().includes(q);
    });
  }, [rows, query, status]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={t("nav.sales")}
        description={t("sale.subtitle")}
        actions={
          <>
            <Link href="/voice">
              <Button variant="outline">
                <Mic className="h-4 w-4" /> {t("nav.voice")}
              </Button>
            </Link>
            <Link href="/sales/new">
              <Button>
                <Plus className="h-4 w-4" /> {t("sale.new")}
              </Button>
            </Link>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`${t("common.search")} ${t("sale.customer").toLowerCase()}…`} className="pl-9" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="sm:w-44">
          <option value="all">{t("common.all")}</option>
          <option value="paid">Paid</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="unpaid">Unpaid</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="h-6 w-6" />}
          title={rows.length === 0 ? t("empty.sales.title") : "No matches"}
          description={rows.length === 0 ? t("empty.sales.desc") : "Try a different search or filter."}
          action={
            rows.length === 0 ? (
              <Link href="/sales/new">
                <Button>
                  <Plus className="h-4 w-4" /> {t("sale.new")}
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <ul className="divide-y divide-line">
            {filtered.map((r) => (
              <li key={r.id}>
                <Link href={`/sales/${r.id}`} className="flex flex-wrap items-center gap-3 p-4 hover:bg-surface-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime/20 text-ink">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{r.customer_name ?? t("sale.walkin")}</div>
                    <div className="text-xs text-content-muted">{formatDate(r.sale_date)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatMoney(r.total_amount, currency)}</div>
                    {r.outstanding_balance > 0 ? (
                      <div className="text-xs text-danger">{formatMoney(r.outstanding_balance, currency)} {t("sale.balance").toLowerCase()}</div>
                    ) : (
                      <div className="text-xs text-success">Paid in full</div>
                    )}
                  </div>
                  <StatusBadge status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
