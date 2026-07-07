"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import { Button, Field, Input, Select, Textarea, Spinner } from "@/components/ui";
import { useI18n } from "@/components/providers";
import { saveExpense } from "@/app/(app)/expenses/actions";
import { EXPENSE_CATEGORIES, type Expense } from "@/lib/types";

export function ExpenseForm({
  open,
  onClose,
  expense,
}: {
  open: boolean;
  onClose: () => void;
  expense?: Expense | null;
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
      const res = await saveExpense(fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Modal open={open} onClose={onClose} title={expense ? t("exp.edit") : t("exp.add")} size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        {expense && <input type="hidden" name="id" defaultValue={expense.id} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("exp.amount")} required>
            <Input name="amount" type="number" min={0} step="0.01" required className="no-spin" defaultValue={expense?.amount ?? ""} placeholder="0" />
          </Field>
          <Field label={t("exp.category")}>
            <Select name="category" defaultValue={expense?.category ?? EXPENSE_CATEGORIES[0]}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("exp.date")}>
            <Input name="expense_date" type="date" defaultValue={expense?.expense_date ?? today} />
          </Field>
          <Field label={t("exp.description")} className="sm:col-span-2">
            <Textarea name="description" defaultValue={expense?.description ?? ""} placeholder={t("exp.descPlaceholder")} />
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
