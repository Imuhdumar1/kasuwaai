"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Phone, MessageCircle, ShoppingCart, CreditCard } from "lucide-react";
import { Avatar, Badge, Button, Card, StatusBadge } from "@/components/ui";
import { StatCard } from "@/components/stat-card";
import { CustomerForm } from "@/components/customers/customer-form";
import { useI18n } from "@/components/providers";
import { formatMoney, formatDate } from "@/lib/format";
import type { Customer } from "@/lib/types";

type SaleLite = {
  id: string;
  sale_date: string;
  total_amount: number;
  outstanding_balance: number;
  status: string;
  due_date: string | null;
};
type PaymentLite = { id: string; amount: number; method: string | null; payment_date: string };

export function CustomerDetail({
  customer,
  sales,
  payments,
  currency,
}: {
  customer: Customer;
  sales: SaleLite[];
  payments: PaymentLite[];
  currency: string;
}) {
  const { t } = useI18n();
  const [editOpen, setEditOpen] = useState(false);

  const owing = sales.reduce((a, s) => a + s.outstanding_balance, 0);
  const spent = sales.reduce((a, s) => a + s.total_amount, 0);
  const waNumber = (customer.whatsapp || customer.phone || "").replace(/[^0-9]/g, "");

  return (
    <div className="animate-fade-up">
      <Link href="/customers" className="mb-4 inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-content">
        <ArrowLeft className="h-4 w-4" /> {t("nav.customers")}
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={customer.full_name} src={customer.photo_url} className="h-14 w-14 text-base" />
          <div>
            <h1 className="font-display text-2xl font-extrabold">{customer.full_name}</h1>
            <div className="mt-0.5 flex items-center gap-2 text-sm text-content-muted">
              {customer.phone || "—"}
              {customer.status === "archived" && <Badge tone="neutral">{t("f.archived")}</Badge>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {customer.phone && (
            <Button variant="outline" size="sm" onClick={() => (window.location.href = `tel:${customer.phone}`)}>
              <Phone className="h-4 w-4" /> {t("cust.call")}
            </Button>
          )}
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
            </a>
          )}
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> {t("common.edit")}
          </Button>
          <Link href={`/sales/new?customer=${customer.id}`}>
            <Button size="sm">
              <ShoppingCart className="h-4 w-4" /> {t("cust.recordSale")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label={t("cust.totalSpent")} value={formatMoney(spent, currency)} />
        <StatCard label={t("cust.owing")} value={formatMoney(owing, currency)} accent={owing > 0 ? "danger" : "none"} />
        <StatCard label={t("nav.sales")} value={String(sales.length)} />
        <StatCard label={t("cust.creditLimit")} value={formatMoney(customer.credit_limit, currency)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-line p-5">
            <h3 className="font-display font-bold">{t("cust.history")}</h3>
          </div>
          {sales.length === 0 ? (
            <p className="p-6 text-sm text-content-muted">{t("empty.sales.desc")}</p>
          ) : (
            <ul className="divide-y divide-line">
              {sales.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <div className="text-sm font-medium">{formatMoney(s.total_amount, currency)}</div>
                    <div className="text-xs text-content-muted">{formatDate(s.sale_date)}</div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={s.status} />
                    {s.outstanding_balance > 0 && (
                      <div className="mt-1 text-xs text-danger">{formatMoney(s.outstanding_balance, currency)} left</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-line p-5">
            <h3 className="font-display font-bold">{t("cust.paymentHistory")}</h3>
          </div>
          {payments.length === 0 ? (
            <p className="p-6 text-sm text-content-muted">{t("empty.debts.desc")}</p>
          ) : (
            <ul className="divide-y divide-line">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/15 text-success">
                      <CreditCard className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-sm font-medium">{formatMoney(p.amount, currency)}</div>
                      <div className="text-xs text-content-muted">{p.method || t("pay.method")}</div>
                    </div>
                  </div>
                  <div className="text-xs text-content-muted">{formatDate(p.payment_date)}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <CustomerForm open={editOpen} onClose={() => setEditOpen(false)} customer={customer} />
    </div>
  );
}
