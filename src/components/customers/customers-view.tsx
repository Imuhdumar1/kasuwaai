"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Search, Plus, Phone, MessageCircle, Pencil, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Avatar, Badge, Button, EmptyState, Input, Select } from "@/components/ui";
import { CustomerForm } from "@/components/customers/customer-form";
import { useI18n } from "@/components/providers";
import { useToast } from "@/components/toast";
import { formatMoney } from "@/lib/format";
import { setCustomerArchived, deleteCustomer } from "@/app/(app)/customers/actions";
import type { Customer } from "@/lib/types";

export type CustomerRow = Customer & { owing: number; totalSpent: number; txCount: number };

export function CustomersView({ rows, currency }: { rows: CustomerRow[]; currency: string }) {
  const { t } = useI18n();
  const { toast, confirm } = useToast();
  const router = useRouter();
  const [, start] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"active" | "archived" | "all">("active");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (!q) return true;
      return (
        c.full_name.toLowerCase().includes(q) ||
        (c.nickname ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").includes(q)
      );
    });
  }, [rows, query, status]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(c: Customer) {
    setEditing(c);
    setFormOpen(true);
  }
  function archive(c: CustomerRow) {
    start(async () => {
      await setCustomerArchived(c.id, c.status === "active");
      router.refresh();
    });
  }
  async function remove(c: CustomerRow) {
    const ok = await confirm({
      title: t("common.sure"),
      message: t("confirm.deleteCustomer", { name: c.full_name }),
      confirmLabel: t("common.delete"),
      danger: true,
    });
    if (!ok) return;
    start(async () => {
      const res = await deleteCustomer(c.id);
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
        title={t("nav.customers")}
        description={t("cust.subtitle")}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> {t("cust.add")}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("cust.search")}
            className="pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="sm:w-40">
          <option value="active">{t("f.active")}</option>
          <option value="archived">{t("f.archived")}</option>
          <option value="all">{t("common.all")}</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={rows.length === 0 ? t("empty.customers.title") : "No matches"}
          description={rows.length === 0 ? t("empty.customers.desc") : "Try a different search or filter."}
          action={
            rows.length === 0 ? (
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4" /> {t("cust.add")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <ul className="divide-y divide-line">
            {filtered.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
                <Link href={`/customers/${c.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={c.full_name} src={c.photo_url} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{c.full_name}</span>
                      {c.status === "archived" && <Badge tone="neutral">{t("f.archived")}</Badge>}
                    </div>
                    <div className="truncate text-xs text-content-muted">{c.phone || c.nickname || "—"}</div>
                  </div>
                </Link>

                <div className="hidden text-right sm:block">
                  <div className="text-xs text-content-muted">{t("cust.totalSpent")}</div>
                  <div className="text-sm font-semibold">{formatMoney(c.totalSpent, currency)}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-content-muted">{t("cust.owing")}</div>
                  <div className={`text-sm font-semibold ${c.owing > 0 ? "text-danger" : ""}`}>
                    {formatMoney(c.owing, currency)}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {c.phone && (
                    <IconLink href={`tel:${c.phone}`} title={t("cust.call")}>
                      <Phone className="h-4 w-4" />
                    </IconLink>
                  )}
                  {(c.whatsapp || c.phone) && (
                    <IconLink
                      href={`https://wa.me/${(c.whatsapp || c.phone || "").replace(/[^0-9]/g, "")}`}
                      title="WhatsApp"
                      external
                    >
                      <MessageCircle className="h-4 w-4" />
                    </IconLink>
                  )}
                  <IconButton onClick={() => openEdit(c)} title={t("common.edit")}>
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                  <IconButton onClick={() => archive(c)} title={c.status === "active" ? t("common.archive") : "Restore"}>
                    {c.status === "active" ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
                  </IconButton>
                  <IconButton onClick={() => remove(c)} title={t("common.delete")} danger>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CustomerForm open={formOpen} onClose={() => setFormOpen(false)} customer={editing} />
    </div>
  );
}

function IconButton({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-lg p-2 text-content-muted transition-colors hover:bg-surface-2 ${danger ? "hover:text-danger" : "hover:text-content"}`}
    >
      {children}
    </button>
  );
}

function IconLink({
  children,
  href,
  title,
  external,
}: {
  children: React.ReactNode;
  href: string;
  title: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      title={title}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="rounded-lg p-2 text-content-muted transition-colors hover:bg-surface-2 hover:text-content"
    >
      {children}
    </a>
  );
}
