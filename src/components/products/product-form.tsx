"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import { Button, Field, Input, Select, Textarea, Spinner } from "@/components/ui";
import { useI18n } from "@/components/providers";
import { saveProduct } from "@/app/(app)/products/actions";
import { PRODUCT_UNITS, type Product } from "@/lib/types";

export function ProductForm({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await saveProduct(fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={product ? t("prod.edit") : t("prod.add")} size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        {product && <input type="hidden" name="id" defaultValue={product.id} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("prod.name")} required className="sm:col-span-2">
            <Input name="name" required defaultValue={product?.name ?? ""} placeholder="e.g. Bag of rice (50kg)" />
          </Field>
          <Field label={t("prod.category")}>
            <Input name="category" defaultValue={product?.category ?? ""} />
          </Field>
          <Field label={t("prod.unit")}>
            <Select name="unit" defaultValue={product?.unit ?? "unit"}>
              {PRODUCT_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("prod.cost")}>
            <Input name="cost_price" type="number" min={0} step="0.01" className="no-spin" defaultValue={product?.cost_price ?? 0} />
          </Field>
          <Field label={t("prod.price")}>
            <Input name="selling_price" type="number" min={0} step="0.01" className="no-spin" defaultValue={product?.selling_price ?? 0} />
          </Field>
          <Field label={t("prod.stock")}>
            <Input name="stock_quantity" type="number" step="0.01" className="no-spin" defaultValue={product?.stock_quantity ?? 0} />
          </Field>
          <Field label={t("prod.sku")}>
            <Input name="sku" defaultValue={product?.sku ?? ""} />
          </Field>
          <Field label={t("prod.barcode")} className="sm:col-span-2">
            <Input name="barcode" defaultValue={product?.barcode ?? ""} />
          </Field>
          <Field label={t("prod.description")} className="sm:col-span-2">
            <Textarea name="description" defaultValue={product?.description ?? ""} />
          </Field>
        </div>

        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner /> : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
