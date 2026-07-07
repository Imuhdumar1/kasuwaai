"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Search, Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge, Button, EmptyState, Input, Select } from "@/components/ui";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { useI18n } from "@/components/providers";
import { useToast } from "@/components/toast";
import { formatMoney, formatDate } from "@/lib/format";
import { deleteExpense } from "@/app/(app)/expenses/actions";
import { EXPENSE_CATEGORIES, type Expense } from "@/lib/types";

export function ExpensesView({ rows, currency }: { rows: Expense[]; currency: string }) {
  const { t } = useI18n();
  const { toast, confirm } = useToast();
  const router = useRouter();
  const [, start] = useTransition();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((e) => {
      if (category !== "all" && (e.category ?? "") !== category) return false;
      if (!q) return true;
      return (e.description ?? "").toLowerCase().includes(q) || (e.category ?? "").toLowerCase().includes(q);
    });
  }, [rows, query, category]);

  // "This month" total across the filtered rows for a quick at-a-glance figure.
  const total = useMemo(() => filtered.reduce((a, e) => a + Number(e.amount), 0), [filtered]);
  const monthTotal = useMemo(() => {
    const m = new Date().toISOString().slice(0, 7);
    return rows.filter((e) => (e.expense_date ?? "").startsWith(m)).reduce((a, e) => a + Number(e.amount), 0);
  }, [rows]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(e: Expense) {
    setEditing(e);
    setFormOpen(true);
  }
  async function remove(e: Expense) {
    const ok = await confirm({
      title: t("common.sure"),
      message: t("exp.confirmDelete"),
      confirmLabel: t("common.delete"),
      danger: true,
    });
    if (!ok) return;
    start(async () => {
      const res = await deleteExpense(e.id);
      if (res?.error) {
        toast({ message: res.error, tone: "error" });
        return;
      }
      router.refresh();
      toast({ message: t("toast.deleted"), tone: "success" });
    });
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={t("nav.expenses")}
        description={t("exp.subtitle")}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> {t("exp.add")}
          </Button>
        }
      />

      {/* Quick totals */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <div className="text-xs text-content-muted">{t("exp.thisMonth")}</div>
          <div className="mt-1 font-display text-2xl font-extrabold">{formatMoney(monthTotal, currency)}</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <div className="text-xs text-content-muted">{t("exp.shownTotal")}</div>
          <div className="mt-1 font-display text-2xl font-extrabold">{formatMoney(total, currency)}</div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("exp.search")} className="pl-9" />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-56">
          <option value="all">{t("common.all")}</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Wallet className="h-6 w-6" />}
          title={rows.length === 0 ? t("empty.expenses.title") : "No matches"}
          description={rows.length === 0 ? t("empty.expenses.desc") : "Try a different search or filter."}
          action={
            rows.length === 0 ? (
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4" /> {t("exp.add")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <ul className="divide-y divide-line">
            {filtered.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatMoney(e.amount, currency)}</span>
                    {e.category && <Badge tone="neutral">{e.category}</Badge>}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-content-muted">
                    {formatDate(e.expense_date)}
                    {e.description ? ` · ${e.description}` : ""}
                  </div>
                </div>
                <div className="flex shrink-0">
                  <button onClick={() => openEdit(e)} title={t("common.edit")} className="rounded-lg p-1.5 text-content-muted hover:bg-surface-2 hover:text-content">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(e)} title={t("common.delete")} className="rounded-lg p-1.5 text-content-muted hover:bg-surface-2 hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ExpenseForm open={formOpen} onClose={() => setFormOpen(false)} expense={editing} />
    </div>
  );
}
