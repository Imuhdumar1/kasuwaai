"use client";

import { useMemo, useState } from "react";
import { History, Plus, Pencil, Trash2, CheckCircle2, RotateCcw } from "lucide-react";
import { Select } from "@/components/ui";
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

/** The activity list + type filter, with no page chrome — embeddable in Settings. */
export function ActivityLog({ rows }: { rows: ActivityRow[] }) {
  const { t } = useI18n();
  const [entity, setEntity] = useState("all");

  const entities = useMemo(() => Array.from(new Set(rows.map((r) => r.entity_type))), [rows]);
  const filtered = useMemo(
    () => (entity === "all" ? rows : rows.filter((r) => r.entity_type === entity)),
    [rows, entity],
  );

  if (rows.length === 0) {
    return <p className="text-sm text-content-muted">{t("history.emptyDesc")}</p>;
  }

  return (
    <div>
      {entities.length > 1 && (
        <div className="mb-3 flex justify-end">
          <Select value={entity} onChange={(e) => setEntity(e.target.value)} className="sm:w-48">
            <option value="all">{t("common.all")}</option>
            {entities.map((e) => (
              <option key={e} value={e}>
                {e.charAt(0).toUpperCase() + e.slice(1)}
              </option>
            ))}
          </Select>
        </div>
      )}

      <ul className="max-h-[28rem] divide-y divide-line overflow-y-auto rounded-xl border border-line">
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
    </div>
  );
}
