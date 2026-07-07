"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Trash2, User, Share2, Check } from "lucide-react";
import { Button, Card, StatusBadge } from "@/components/ui";
import { PaymentForm } from "@/components/payments/payment-form";
import { useI18n } from "@/components/providers";
import { useToast } from "@/components/toast";
import { formatMoney, formatDate, formatDateTime, relativeDueLabel } from "@/lib/format";
import { buildReceipt } from "@/lib/receipt";
import { deleteSale } from "@/app/(app)/sales/actions";
import type { Sale, SaleItem, Payment } from "@/lib/types";

export function SaleDetail({
  sale,
  items,
  payments,
  customer,
  currency,
  businessName,
}: {
  sale: Sale;
  items: SaleItem[];
  payments: Payment[];
  customer: { id: string; full_name: string } | null;
  currency: string;
  businessName: string;
}) {
  const { t } = useI18n();
  const { toast, confirm } = useToast();
  const router = useRouter();
  const [payOpen, setPayOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const [, start] = useTransition();

  async function remove() {
    const ok = await confirm({
      title: t("common.sure"),
      message: t("confirm.deleteSale"),
      confirmLabel: t("common.delete"),
      danger: true,
    });
    if (!ok) return;
    start(async () => {
      const res = await deleteSale(sale.id);
      if (res?.error) {
        toast({ message: res.error, tone: "error" });
        return;
      }
      router.push("/sales");
      router.refresh();
    });
  }

  async function share() {
    const data = {
      businessName,
      customerName: customer?.full_name ?? null,
      date: sale.sale_date,
      items: items.map((it) => ({ name: it.product_name, quantity: it.quantity, lineTotal: it.line_total })),
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.tax,
      total: sale.total_amount,
      paid: sale.amount_paid,
      balance: sale.outstanding_balance,
      currency,
    };
    const text = buildReceipt(data); // caption + fallback

    const { renderReceiptImage } = await import("@/lib/receipt-image");
    const blob = await renderReceiptImage(data);

    if (blob) {
      const file = new File([blob], `receipt-${businessName}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: { files?: File[] }) => boolean };
      // Share the image file itself (Android Chrome, iOS Safari → WhatsApp, etc.)
      if (nav.canShare && nav.canShare({ files: [file] }) && navigator.share) {
        try {
          await navigator.share({ files: [file], title: `${businessName} — receipt`, text });
          return;
        } catch {
          /* cancelled — fall through to download */
        }
      }
      // Download fallback (desktop / unsupported)
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
      return;
    }

    // Image couldn't be generated → text fallback.
    if (navigator.share) {
      try {
        await navigator.share({ title: `${businessName} — receipt`, text });
        return;
      } catch {
        /* fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="animate-fade-up">
      <Link href="/sales" className="mb-4 inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-content">
        <ArrowLeft className="h-4 w-4" /> {t("nav.sales")}
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-extrabold">{formatMoney(sale.total_amount, currency)}</h1>
            <StatusBadge status={sale.status} />
          </div>
          <div className="mt-1 text-sm text-content-muted">{formatDateTime(sale.sale_date)}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {sale.outstanding_balance > 0 && (
            <Button onClick={() => setPayOpen(true)}>
              <CreditCard className="h-4 w-4" /> {t("pay.record")}
            </Button>
          )}
          <Button variant="outline" onClick={share}>
            {shared ? <Check className="h-4 w-4 text-success" /> : <Share2 className="h-4 w-4" />}
            {shared ? "Done" : "Share"}
          </Button>
          <Button variant="outline" onClick={remove}>
            <Trash2 className="h-4 w-4" /> {t("common.delete")}
          </Button>
        </div>
      </div>

      {customer && (
        <Link
          href={`/customers/${customer.id}`}
          className="mb-4 inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:bg-surface-2"
        >
          <User className="h-4 w-4 text-content-muted" /> {customer.full_name}
        </Link>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <div className="border-b border-line p-5">
            <h3 className="font-display font-bold">{t("sale.item")}s</h3>
          </div>
          <ul className="divide-y divide-line">
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="truncate font-medium">{it.product_name}</div>
                  <div className="text-xs text-content-muted">
                    {it.quantity} × {formatMoney(it.unit_price, currency)}
                  </div>
                </div>
                <div className="shrink-0 font-semibold">{formatMoney(it.line_total, currency)}</div>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 border-t border-line p-5 text-sm">
            <Row label={t("sale.subtotal")} value={formatMoney(sale.subtotal, currency)} />
            {sale.discount > 0 && <Row label={t("sale.discount")} value={`− ${formatMoney(sale.discount, currency)}`} />}
            {sale.tax > 0 && <Row label={t("sale.tax")} value={`+ ${formatMoney(sale.tax, currency)}`} />}
            <div className="flex justify-between border-t border-line pt-2 font-display text-base font-extrabold">
              <span>{t("f.total")}</span>
              <span>{formatMoney(sale.total_amount, currency)}</span>
            </div>
            <Row label={t("dash.payments")} value={formatMoney(sale.amount_paid, currency)} />
            <div className="flex justify-between font-semibold">
              <span>{t("sale.balance")}</span>
              <span className={sale.outstanding_balance > 0 ? "text-danger" : "text-success"}>
                {formatMoney(sale.outstanding_balance, currency)}
              </span>
            </div>
          </div>
        </Card>

        <div className="min-w-0 space-y-4">
          {sale.due_date && sale.outstanding_balance > 0 && (
            <Card className="p-5">
              <div className="text-xs uppercase text-content-muted">{t("sale.dueDate")}</div>
              <div className="mt-1 font-display text-lg font-bold">{formatDate(sale.due_date)}</div>
              <div className="text-sm text-content-muted">{relativeDueLabel(sale.due_date)}</div>
            </Card>
          )}

          <Card>
            <div className="border-b border-line p-5">
              <h3 className="font-display font-bold">{t("cust.paymentHistory")}</h3>
            </div>
            {payments.length === 0 ? (
              <p className="p-5 text-sm text-content-muted">No payments yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <div className="text-sm font-semibold">{formatMoney(p.amount, currency)}</div>
                      <div className="text-xs text-content-muted">
                        {p.method || "Cash"} · {formatDate(p.payment_date)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {sale.notes && (
            <Card className="p-5">
              <div className="text-xs uppercase text-content-muted">{t("f.notes")}</div>
              <p className="mt-1 text-sm">{sale.notes}</p>
            </Card>
          )}
        </div>
      </div>

      <PaymentForm
        open={payOpen}
        onClose={() => setPayOpen(false)}
        currency={currency}
        sale={{
          id: sale.id,
          label: customer?.full_name ?? t("sale.walkin"),
          outstanding_balance: sale.outstanding_balance,
        }}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-content-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
