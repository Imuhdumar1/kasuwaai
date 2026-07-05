"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import { Button, Field, Input, Select, Textarea, Spinner } from "@/components/ui";
import { useI18n } from "@/components/providers";
import { formatMoney } from "@/lib/format";
import { recordPayment } from "@/app/(app)/payments/actions";
import { PAYMENT_METHODS } from "@/lib/types";

export type PayableSale = { id: string; label: string; outstanding_balance: number };

export function PaymentForm({
  open,
  onClose,
  sale,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  sale: PayableSale | null;
  currency: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  if (!sale) return null;

  const amt = Number(amount) || 0;
  const balanceAfter = Math.max(0, sale.outstanding_balance - amt);
  const overpay = amt > sale.outstanding_balance + 0.005;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (overpay) {
      setError(t("pay.overpay"));
      return;
    }
    start(async () => {
      const res = await recordPayment({
        sale_id: sale!.id,
        amount: amt,
        method,
        reference_number: reference.trim() || null,
        payment_date: date ? new Date(date).toISOString() : null,
        notes: notes.trim() || null,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      // reset for next time
      setAmount("");
      setReference("");
      setNotes("");
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={t("pay.record")} description={sale.label} size="sm">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
          <span className="text-content-muted">{t("sale.balance")}</span>
          <span className="font-semibold">{formatMoney(sale.outstanding_balance, currency)}</span>
        </div>

        <Field label={t("pay.amount")} required error={overpay ? t("pay.overpay") : undefined}>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              step="any"
              className="no-spin"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
            />
            <Button type="button" variant="outline" onClick={() => setAmount(String(sale.outstanding_balance))}>
              Full
            </Button>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("pay.method")}>
            <Select value={method} onChange={(e) => setMethod(e.target.value)}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("pay.date")}>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>

        <Field label={t("pay.reference")}>
          <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Optional" />
        </Field>
        <Field label={t("f.notes")}>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <div className="flex items-center justify-between text-sm">
          <span className="text-content-muted">{t("debt.remaining")}</span>
          <span className={`font-semibold ${balanceAfter > 0 ? "" : "text-success"}`}>
            {formatMoney(balanceAfter, currency)}
          </span>
        </div>

        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={pending || overpay || amt <= 0}>
            {pending ? <Spinner /> : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
