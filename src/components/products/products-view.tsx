"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Package, Search, Plus, Pencil, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge, Button, EmptyState, Input, Select } from "@/components/ui";
import { ProductForm } from "@/components/products/product-form";
import { useI18n } from "@/components/providers";
import { formatMoney, formatNumber } from "@/lib/format";
import { setProductArchived, deleteProduct } from "@/app/(app)/products/actions";
import type { Product } from "@/lib/types";

export type ProductRow = Product & { soldQty: number; revenue: number };

export function ProductsView({ rows, currency }: { rows: ProductRow[]; currency: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [, start] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"active" | "archived" | "all">("active");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q);
    });
  }, [rows, query, status]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setFormOpen(true);
  }
  function archive(p: ProductRow) {
    start(async () => {
      await setProductArchived(p.id, p.status === "active");
      router.refresh();
    });
  }
  function remove(p: ProductRow) {
    if (!confirm(`Delete ${p.name}? This cannot be undone.`)) return;
    start(async () => {
      await deleteProduct(p.id);
      router.refresh();
    });
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={t("nav.products")}
        description={t("prod.subtitle")}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> {t("prod.add")}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("prod.search")} className="pl-9" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="sm:w-40">
          <option value="active">{t("f.active")}</option>
          <option value="archived">{t("f.archived")}</option>
          <option value="all">{t("common.all")}</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title={rows.length === 0 ? t("empty.products.title") : "No matches"}
          description={rows.length === 0 ? t("empty.products.desc") : "Try a different search or filter."}
          action={
            rows.length === 0 ? (
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4" /> {t("prod.add")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const margin = p.selling_price > 0 ? Math.round(((p.selling_price - p.cost_price) / p.selling_price) * 100) : 0;
            return (
              <div key={p.id} className="flex flex-col rounded-2xl border border-line bg-surface p-4 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{p.name}</span>
                      {p.status === "archived" && <Badge tone="neutral">{t("f.archived")}</Badge>}
                    </div>
                    <div className="text-xs text-content-muted">{p.category || "—"}</div>
                  </div>
                  <div className="flex shrink-0">
                    <button onClick={() => openEdit(p)} title={t("common.edit")} className="rounded-lg p-1.5 text-content-muted hover:bg-surface-2 hover:text-content">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => archive(p)} title={p.status === "active" ? t("common.archive") : "Restore"} className="rounded-lg p-1.5 text-content-muted hover:bg-surface-2 hover:text-content">
                      {p.status === "active" ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
                    </button>
                    <button onClick={() => remove(p)} title={t("common.delete")} className="rounded-lg p-1.5 text-content-muted hover:bg-surface-2 hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="font-display text-xl font-extrabold">{formatMoney(p.selling_price, currency)}</div>
                    <div className="text-xs text-content-muted">
                      {t("prod.cost")}: {formatMoney(p.cost_price, currency)}
                    </div>
                  </div>
                  {margin > 0 && <Badge tone="lime">{margin}% margin</Badge>}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-content-muted">
                  <span>
                    {formatNumber(p.stock_quantity)} {p.unit} in stock
                  </span>
                  <span>
                    {formatNumber(p.soldQty)} {t("prod.sold")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProductForm open={formOpen} onClose={() => setFormOpen(false)} product={editing} />
    </div>
  );
}
