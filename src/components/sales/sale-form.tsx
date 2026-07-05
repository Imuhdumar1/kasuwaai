"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button, Card, Field, Input, Select, Textarea, Spinner } from "@/components/ui";
import { useI18n } from "@/components/providers";
import { formatMoney } from "@/lib/format";
import { createSale, type SaleInput } from "@/app/(app)/sales/actions";
import { PAYMENT_METHODS } from "@/lib/types";

export type CustomerLite = { id: string; full_name: string };
export type ProductLite = { id: string; name: string; selling_price: number; cost_price: number; unit: string };

type Line = {
  key: number;
  mode: "product" | "custom";
  product_id: string;
  name: string;
  quantity: string;
  unit_price: string;
  cost_price: number;
};

export type SaleInitial = {
  customer_id?: string | null;
  items?: { product_id?: string | null; product_name: string; quantity: number; unit_price: number; cost_price?: number }[];
  discount?: number;
  amount_paid?: number;
  due_date?: string | null;
  notes?: string | null;
  payment_method?: string | null;
};

let keySeq = 1;
const emptyLine = (): Line => ({ key: keySeq++, mode: "product", product_id: "", name: "", quantity: "1", unit_price: "", cost_price: 0 });

export function SaleForm({
  customers,
  products,
  currency,
  prefillCustomerId,
  initial,
  source = "manual",
}: {
  customers: CustomerLite[];
  products: ProductLite[];
  currency: string;
  prefillCustomerId?: string;
  initial?: SaleInitial;
  source?: "manual" | "voice";
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState(initial?.customer_id ?? prefillCustomerId ?? "");
  const [lines, setLines] = useState<Line[]>(() => {
    if (initial?.items?.length) {
      return initial.items.map((it) => ({
        key: keySeq++,
        mode: it.product_id ? ("product" as const) : ("custom" as const),
        product_id: it.product_id ?? "",
        name: it.product_name,
        quantity: String(it.quantity),
        unit_price: String(it.unit_price),
        cost_price: it.cost_price ?? 0,
      }));
    }
    return [emptyLine()];
  });
  const [discount, setDiscount] = useState(String(initial?.discount ?? ""));
  const [tax, setTax] = useState("");
  const [amountPaid, setAmountPaid] = useState(String(initial?.amount_paid ?? ""));
  const [dueDate, setDueDate] = useState(initial?.due_date ?? "");
  const [method, setMethod] = useState(initial?.payment_method ?? "Cash");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const num = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };

  const totals = useMemo(() => {
    const subtotal = lines.reduce((a, l) => a + num(l.quantity) * num(l.unit_price), 0);
    const disc = Math.max(0, num(discount));
    const tx = Math.max(0, num(tax));
    const total = Math.max(0, subtotal - disc + tx);
    const profit = lines.reduce((a, l) => a + (num(l.unit_price) - l.cost_price) * num(l.quantity), 0) - disc;
    const paid = Math.min(Math.max(0, num(amountPaid)), total);
    const balance = Math.max(0, total - paid);
    return { subtotal, disc, tx, total, profit, paid, balance };
  }, [lines, discount, tax, amountPaid]);

  function updateLine(key: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }
  function onSelectProduct(key: number, value: string) {
    if (value === "custom") {
      updateLine(key, { mode: "custom", product_id: "", name: "", cost_price: 0 });
      return;
    }
    const p = products.find((x) => x.id === value);
    if (p) {
      updateLine(key, { mode: "product", product_id: p.id, name: p.name, unit_price: String(p.selling_price), cost_price: p.cost_price });
    } else {
      updateLine(key, { mode: "product", product_id: "", name: "" });
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const items = lines
      .filter((l) => num(l.quantity) > 0 && l.name.trim())
      .map((l) => ({
        product_id: l.mode === "product" && l.product_id ? l.product_id : null,
        product_name: l.name.trim(),
        quantity: num(l.quantity),
        unit_price: num(l.unit_price),
        cost_price: l.cost_price,
      }));
    if (items.length === 0) {
      setError("Add at least one item with a quantity.");
      return;
    }
    const payload: SaleInput = {
      customer_id: customerId || null,
      items,
      discount: Math.max(0, num(discount)),
      tax: Math.max(0, num(tax)),
      amount_paid: Math.max(0, num(amountPaid)),
      due_date: totals.balance > 0 ? dueDate || null : null,
      payment_method: method || null,
      notes: notes.trim() || null,
      source,
    };
    start(async () => {
      const res = await createSale(payload);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push("/sales");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-3">
      {/* Items + customer */}
      <div className="space-y-4 lg:col-span-2">
        <Card className="p-5">
          <Field label={t("sale.customer")}>
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">{t("sale.walkin")}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </Select>
          </Field>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display font-bold">{t("sale.item")}s</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => setLines((l) => [...l, emptyLine()])}>
              <Plus className="h-4 w-4" /> {t("sale.addItem")}
            </Button>
          </div>

          <div className="space-y-3">
            {lines.map((l) => (
              <div key={l.key} className="rounded-xl border border-line p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
                  <div className="min-w-0">
                    <Select
                      value={l.mode === "custom" ? "custom" : l.product_id}
                      onChange={(e) => onSelectProduct(l.key, e.target.value)}
                      className="mb-2"
                    >
                      <option value="">{t("sale.product")}…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                      <option value="custom">+ {t("common.add")} custom item</option>
                    </Select>
                    {l.mode === "custom" && (
                      <Input
                        placeholder={t("sale.product")}
                        value={l.name}
                        onChange={(e) => updateLine(l.key, { name: e.target.value })}
                      />
                    )}
                  </div>
                  <div className="w-20">
                    <label className="mb-1 block text-xs text-content-muted">{t("sale.qty")}</label>
                    <Input type="number" min={0} step="any" className="no-spin" value={l.quantity} onChange={(e) => updateLine(l.key, { quantity: e.target.value })} />
                  </div>
                  <div className="w-28">
                    <label className="mb-1 block text-xs text-content-muted">{t("sale.unitPrice")}</label>
                    <Input type="number" min={0} step="any" className="no-spin" value={l.unit_price} onChange={(e) => updateLine(l.key, { unit_price: e.target.value })} />
                  </div>
                  <div className="flex items-end justify-between gap-2 sm:w-28">
                    <div className="min-w-0">
                      <label className="mb-1 block text-xs text-content-muted">{t("f.total")}</label>
                      <div className="truncate py-2 text-sm font-semibold">{formatMoney(num(l.quantity) * num(l.unit_price), currency)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((x) => x.key !== l.key) : ls))}
                      className="mb-1 rounded-lg p-2 text-content-muted hover:bg-surface-2 hover:text-danger"
                      title={t("common.delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <Field label={t("f.notes")}>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note about this sale" />
          </Field>
        </Card>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <Card className="p-5 lg:sticky lg:top-24">
          <h3 className="mb-4 font-display font-bold">{t("sale.subtotal")}</h3>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("sale.discount")}>
              <Input type="number" min={0} step="any" className="no-spin" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
            </Field>
            <Field label={t("sale.tax")}>
              <Input type="number" min={0} step="any" className="no-spin" value={tax} onChange={(e) => setTax(e.target.value)} placeholder="0" />
            </Field>
          </div>

          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <Row label={t("sale.subtotal")} value={formatMoney(totals.subtotal, currency)} />
            {totals.disc > 0 && <Row label={t("sale.discount")} value={`− ${formatMoney(totals.disc, currency)}`} />}
            {totals.tx > 0 && <Row label={t("sale.tax")} value={`+ ${formatMoney(totals.tx, currency)}`} />}
            <div className="flex justify-between border-t border-line pt-2 font-display text-base font-extrabold">
              <span>{t("f.total")}</span>
              <span>{formatMoney(totals.total, currency)}</span>
            </div>
          </dl>

          <div className="mt-4 border-t border-line pt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium">{t("sale.amountPaid")}</label>
              <div className="flex gap-1">
                <button type="button" onClick={() => setAmountPaid(String(totals.total))} className="rounded-md bg-surface-2 px-2 py-0.5 text-xs hover:bg-lime/30">
                  Full
                </button>
                <button type="button" onClick={() => setAmountPaid("0")} className="rounded-md bg-surface-2 px-2 py-0.5 text-xs hover:bg-surface-2">
                  None
                </button>
              </div>
            </div>
            <Input type="number" min={0} step="any" className="no-spin" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0" />

            <div className="mt-2 flex justify-between text-sm">
              <span className="text-content-muted">{t("sale.balance")}</span>
              <span className={`font-semibold ${totals.balance > 0 ? "text-danger" : "text-success"}`}>
                {formatMoney(totals.balance, currency)}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <Field label={t("sale.method")}>
              <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </Field>
            {totals.balance > 0 && (
              <Field label={t("sale.dueDate")}>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
            )}
          </div>

          {error && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

          <Button type="submit" className="mt-4 w-full" disabled={pending}>
            {pending ? <Spinner /> : (
              <>
                <ShoppingCart className="h-4 w-4" /> {t("sale.save")}
              </>
            )}
          </Button>
        </Card>
      </div>
    </form>
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
