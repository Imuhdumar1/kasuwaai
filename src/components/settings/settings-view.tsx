"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, SlidersHorizontal, Lock, Database, TriangleAlert, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, Card, Field, Input, Select, Spinner } from "@/components/ui";
import { useI18n, useTheme } from "@/components/providers";
import { useToast } from "@/components/toast";
import { createClient } from "@/lib/supabase/client";
import { downloadCSV } from "@/lib/csv";
import { updateBusiness, updatePreferences, deleteAllData } from "@/app/(app)/settings/actions";
import { BUSINESS_CATEGORIES, type Business } from "@/lib/types";
import type { Lang } from "@/lib/i18n";

function Section({ icon, title, description, children }: { icon: React.ReactNode; title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-content-muted">{icon}</div>
        <div>
          <h3 className="font-display font-bold">{title}</h3>
          {description && <p className="text-sm text-content-muted">{description}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

function Saved({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1 text-sm text-success">
      <Check className="h-4 w-4" /> Saved
    </span>
  );
}

export function SettingsView({ business }: { business: Business }) {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  return (
    <div className="animate-fade-up">
      <PageHeader title={t("nav.settings")} description={business.business_name} />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="lg:col-span-2">
          <ProfileSection business={business} />
        </div>
        <PreferencesSection business={business} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} router={router} />
        <PasswordSection />
        <DataSection business={business} />
      </div>
    </div>
  );
}

function ProfileSection({ business }: { business: Business }) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await updateBusiness(fd);
      if (res.error) return setError(res.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    });
  }

  return (
    <Section icon={<Building2 className="h-5 w-5" />} title="Business profile">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("biz.name")} required className="sm:col-span-2">
            <Input name="business_name" required defaultValue={business.business_name} />
          </Field>
          <Field label={t("biz.owner")}>
            <Input name="owner_name" defaultValue={business.owner_name ?? ""} />
          </Field>
          <Field label={t("biz.phone")}>
            <Input name="phone" defaultValue={business.phone ?? ""} />
          </Field>
          <Field label={t("auth.email")}>
            <Input name="email" type="email" defaultValue={business.email ?? ""} />
          </Field>
          <Field label={t("biz.category")}>
            <Select name="business_category" defaultValue={business.business_category ?? ""}>
              <option value="">—</option>
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("biz.market")}>
            <Input name="market_location" defaultValue={business.market_location ?? ""} />
          </Field>
          <Field label={t("biz.state")}>
            <Input name="state" defaultValue={business.state ?? ""} />
          </Field>
          <Field label={t("biz.lga")}>
            <Input name="lga" defaultValue={business.lga ?? ""} />
          </Field>
          <Field label="Logo URL" className="sm:col-span-2">
            <Input name="logo_url" defaultValue={business.logo_url ?? ""} placeholder="https://…" />
          </Field>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner /> : t("common.save")}
          </Button>
          <Saved show={saved} />
        </div>
      </form>
    </Section>
  );
}

function PreferencesSection({
  business,
  lang,
  setLang,
  theme,
  setTheme,
  router,
}: {
  business: Business;
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const notif = (business.notification_settings ?? {}) as Record<string, boolean>;

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const currency = String(fd.get("currency"));
    const language = String(fd.get("language"));
    const notification_settings = {
      payment_received: fd.get("payment_received") === "on",
      debt_due: fd.get("debt_due") === "on",
      overdue: fd.get("overdue") === "on",
      weekly_summary: fd.get("weekly_summary") === "on",
    };
    start(async () => {
      await updatePreferences({ currency, language, notification_settings });
      setLang(language as Lang);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    });
  }

  return (
    <Section icon={<SlidersHorizontal className="h-5 w-5" />} title="Preferences" description="Currency, language, theme and notifications.">
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Currency">
            <Select name="currency" defaultValue={business.currency}>
              <option value="NGN">₦ Naira (NGN)</option>
              <option value="USD">$ Dollar (USD)</option>
              <option value="GHS">GH₵ Cedi (GHS)</option>
              <option value="KES">KSh Shilling (KES)</option>
            </Select>
          </Field>
          <Field label="Language">
            <Select name="language" defaultValue={lang}>
              <option value="en">English</option>
              <option value="ha">Hausa</option>
            </Select>
          </Field>
        </div>

        <div>
          <div className="mb-1.5 text-sm font-medium">Theme</div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setTheme("light")} className={`rounded-lg border px-4 py-2 text-sm ${theme === "light" ? "border-lime bg-lime/15" : "border-line"}`}>
              Light
            </button>
            <button type="button" onClick={() => setTheme("dark")} className={`rounded-lg border px-4 py-2 text-sm ${theme === "dark" ? "border-lime bg-lime/15" : "border-line"}`}>
              Dark
            </button>
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-medium">Notifications</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["payment_received", "Payment received"],
              ["debt_due", "Debt due today"],
              ["overdue", "Overdue debt"],
              ["weekly_summary", "Weekly summary"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm">
                <input type="checkbox" name={key} defaultChecked={notif[key] ?? true} className="h-4 w-4 accent-lime" />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner /> : "Save preferences"}
          </Button>
          <Saved show={saved} />
        </div>
      </form>
    </Section>
  );
}

function PasswordSection() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw !== pw2) return setMsg({ text: "Passwords do not match." });
    start(async () => {
      const { error } = await createClient().auth.updateUser({ password: pw });
      if (error) return setMsg({ text: error.message });
      setPw("");
      setPw2("");
      setMsg({ ok: true, text: "Password updated." });
    });
  }

  return (
    <Section icon={<Lock className="h-5 w-5" />} title="Password" description="Change your account password.">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="New password">
          <Input type="password" minLength={6} required value={pw} onChange={(e) => setPw(e.target.value)} />
        </Field>
        <Field label="Confirm password">
          <Input type="password" minLength={6} required value={pw2} onChange={(e) => setPw2(e.target.value)} />
        </Field>
        <div className="sm:col-span-2 flex items-center gap-3">
          <Button type="submit" disabled={pending || !pw}>
            {pending ? <Spinner /> : "Update password"}
          </Button>
          {msg && <span className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</span>}
        </div>
      </form>
    </Section>
  );
}

function DataSection({ business }: { business: Business }) {
  const { t } = useI18n();
  const { toast, confirm } = useToast();
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    setLastBackup(localStorage.getItem("kasuwa_last_backup"));
  }, []);

  const daysSince = lastBackup ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86_400_000) : null;
  const staleBackup = daysSince === null || daysSince >= 7;

  async function exportAll() {
    setExporting(true);
    const supabase = createClient();
    const [c, p, s, pay, exp] = await Promise.all([
      supabase.from("customers").select("*").eq("business_id", business.id),
      supabase.from("products").select("*").eq("business_id", business.id),
      supabase.from("sales").select("*, sale_items(*)").eq("business_id", business.id),
      supabase.from("payments").select("*").eq("business_id", business.id),
      supabase.from("expenses").select("*").eq("business_id", business.id),
    ]);
    const data = { business, customers: c.data, products: p.data, sales: s.data, payments: pay.data, expenses: exp.data, exported_at: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${business.business_name}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    const now = new Date().toISOString();
    localStorage.setItem("kasuwa_last_backup", now);
    setLastBackup(now);
    toast({ message: t("backup.done"), tone: "success" });
    setExporting(false);
  }

  async function exportCustomersCsv() {
    const supabase = createClient();
    const { data } = await supabase.from("customers").select("full_name, phone, credit_limit").eq("business_id", business.id);
    downloadCSV(`${business.business_name}-customers`, ["Name", "Phone", "Credit limit"], (data ?? []).map((c) => [c.full_name, c.phone ?? "", c.credit_limit]));
  }

  async function removeAll() {
    const ok = await confirm({
      title: t("common.sure"),
      message: t("confirm.wipeAll"),
      confirmLabel: t("common.delete"),
      danger: true,
    });
    if (!ok) return;
    startDelete(async () => {
      const res = await deleteAllData();
      if (res?.error) {
        toast({ message: res.error, tone: "error" });
        return;
      }
      await createClient().auth.signOut();
      router.replace("/login");
    });
  }

  return (
    <>
      <Section icon={<Database className="h-5 w-5" />} title="Your data" description="Export a backup of everything.">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportAll} disabled={exporting}>
            {exporting ? <Spinner /> : "Export all (JSON)"}
          </Button>
          <Button variant="outline" onClick={exportCustomersCsv}>
            Export customers (CSV)
          </Button>
        </div>
        <div className="mt-3 text-xs">
          {staleBackup ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-lime/15 px-2.5 py-1.5 font-medium text-ink dark:text-lime">
              <TriangleAlert className="h-3.5 w-3.5" />
              {lastBackup ? t("backup.stale", { days: daysSince ?? 0 }) : t("backup.never")}
            </span>
          ) : (
            <span className="text-content-muted">
              {daysSince === 0 ? t("backup.today") : t("backup.last", { days: daysSince ?? 0 })}
            </span>
          )}
        </div>
      </Section>

      <Card className="border-danger/30 p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger/10 text-danger">
            <TriangleAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-danger">Danger zone</h3>
            <p className="text-sm text-content-muted">Permanently delete all your business records.</p>
          </div>
        </div>
        <Button variant="danger" onClick={removeAll} disabled={deleting}>
          {deleting ? <Spinner /> : "Delete all my data"}
        </Button>
      </Card>
    </>
  );
}
