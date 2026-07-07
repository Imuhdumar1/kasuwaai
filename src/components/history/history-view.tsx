"use client";

import { useMemo, useState } from "react";
import { History, Plus, Pencil, Trash2, CheckCircle2, RotateCcw, ListFilter } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, EmptyState, Select } from "@/components/ui";
import { useI18n } from "@/components/providers";
import { formatDateTime } from "@/lib/format";

export type ActivityRow = {
  id: string;
  actor: string | null;
  action: "create" | "update" | "delete" | "settle" | "restore" | string;
  entity_type: string;
  entity_id: string | null;
  summary: string;
  created_at: string;
};

const ACTION_META: Record<string, { icon: typeof Plus; cls: string }> = {
  create: { icon: Plus, cls: "bg-success/15 text-success" },
  update: { icon: Pencil, cls: "bg-lime/20 text-ink" },
  delete: { icon: Trash2, cls: "bg-danger/12 text-danger" },
  settle: { icon: CheckCircle2, cls: "bg-success/15 text-success" },
  restore: { icon: RotateCcw, cls: "bg-lime/20 text-ink" },
};

export function HistoryView({ rows }: { rows: ActivityRow[] }) {
  const { t } = useI18n();
  const [entity, setEntity] = useState("all");

  const entities = useMemo(() => Array.from(new Set(rows.map((r) => r.entity_type))), [rows]);
  const filtered = useMemo(
    () => (entity === "all" ? rows : rows.filter((r) => r.entity_type === entity)),
    [rows, entity],
  );

  return (
    <div className="animate-fade-up">
      <PageHeader title={t("nav.history")} description={t("history.subtitle")} />

      {rows.length > 0 && (
        <div className="mb-4 flex justify-end">
          <div className="relative">
            <ListFilter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
            <Select value={entity} onChange={(e) => setEntity(e.target.value)} className="pl-9 sm:w-52">
              <option value="all">{t("common.all")}</option>
              {entities.map((e) => (
                <option key={e} value={e}>
                  {e.charAt(0).toUpperCase() + e.slice(1)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={<History className="h-6 w-6" />} title={t("history.empty")} description={t("history.emptyDesc")} />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {filtered.map((r) => {
              const meta = ACTION_META[r.action] ?? { icon: History, cls: "bg-surface-2 text-content-muted" };
              const Icon = meta.icon;
              return (
                <li key={r.id} className="flex items-start gap-3 p-4">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.cls}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{r.summary}</div>
                    <div className="mt-0.5 text-xs text-content-muted">
                      {formatDateTime(r.created_at)}
                      {r.actor ? ` · ${r.actor}` : ""}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
