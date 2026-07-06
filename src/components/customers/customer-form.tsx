"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import { Button, Field, Input, Select, Textarea, Spinner } from "@/components/ui";
import { useI18n } from "@/components/providers";
import { saveCustomer } from "@/app/(app)/customers/actions";
import type { Customer } from "@/lib/types";

export function CustomerForm({
  open,
  onClose,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
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
      const res = await saveCustomer(fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={customer ? t("cust.edit") : t("cust.add")}
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {customer && <input type="hidden" name="id" defaultValue={customer.id} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("cust.fullName")} required className="sm:col-span-2">
            <Input name="full_name" required defaultValue={customer?.full_name ?? ""} placeholder="e.g. Haruna Musa" />
          </Field>
          <Field label={t("cust.nickname")}>
            <Input name="nickname" defaultValue={customer?.nickname ?? ""} />
          </Field>
          <Field label={t("f.phone")}>
            <Input name="phone" type="tel" defaultValue={customer?.phone ?? ""} placeholder="080..." />
          </Field>
          <Field label={t("cust.whatsapp")}>
            <Input name="whatsapp" type="tel" defaultValue={customer?.whatsapp ?? ""} />
          </Field>
          <Field label={t("cust.email")}>
            <Input name="email" type="email" defaultValue={customer?.email ?? ""} />
          </Field>
          <Field label={t("cust.gender")}>
            <Select name="gender" defaultValue={customer?.gender ?? ""}>
              <option value="">—</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </Field>
          <Field label={t("cust.creditLimit")}>
            <Input name="credit_limit" type="number" min={0} step="0.01" className="no-spin" defaultValue={customer?.credit_limit ?? 0} />
          </Field>
          <Field label={t("cust.market")}>
            <Input name="market" defaultValue={customer?.market ?? ""} />
          </Field>
          <Field label={t("cust.businessType")}>
            <Input name="business_type" defaultValue={customer?.business_type ?? ""} />
          </Field>
          <Field label={t("cust.address")} className="sm:col-span-2">
            <Input name="address" defaultValue={customer?.address ?? ""} />
          </Field>
          <Field label={t("f.notes")} className="sm:col-span-2">
            <Textarea name="notes" defaultValue={customer?.notes ?? ""} />
          </Field>
        </div>

        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-2 border-t border-line bg-surface px-5 py-3">
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
