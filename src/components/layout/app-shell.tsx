"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Receipt,
  CreditCard,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Sun,
  Moon,
  Languages,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n, useTheme } from "@/components/providers";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui";
import { Logo } from "@/components/logo";
import type { Business } from "@/lib/types";

const NAV: { href: string; icon: React.ElementType; key: string }[] = [
  { href: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
  { href: "/sales", icon: ShoppingCart, key: "nav.sales" },
  { href: "/customers", icon: Users, key: "nav.customers" },
  { href: "/products", icon: Package, key: "nav.products" },
  { href: "/debts", icon: Receipt, key: "nav.debts" },
  { href: "/payments", icon: CreditCard, key: "nav.payments" },
  { href: "/assistant", icon: Sparkles, key: "nav.assistant" },
  { href: "/reports", icon: BarChart3, key: "nav.reports" },
  { href: "/settings", icon: Settings, key: "nav.settings" },
];

export function AppShell({ business, children }: { business: Business; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-surface lg:flex print:hidden">
        <SidebarContent business={business} onNavigate={() => {}} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[260px] flex-col border-r border-line bg-surface">
            <SidebarContent business={business} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <Topbar business={business} onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ business, onNavigate }: { business: Business; onNavigate: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <>
      <div className="flex h-16 items-center border-b border-line px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map(({ href, icon: Icon, key }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-ink text-paper"
                  : "text-content-muted hover:bg-surface-2 hover:text-content",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {t(key)}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={business.owner_name || business.business_name} src={business.logo_url} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{business.business_name}</div>
            <div className="truncate text-xs text-content-muted">
              {business.market_location || business.state || t("app.tagline")}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Topbar({ business, onMenu }: { business: Business; onMenu: () => void }) {
  const router = useRouter();
  const { lang, setLang, t } = useI18n();
  const { theme, toggle } = useTheme();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-bg px-4 sm:px-6 lg:px-8 print:hidden">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-content-muted hover:bg-surface-2 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden text-sm text-content-muted sm:block">
        {business.currency} · {t("app.name")}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={() => setLang(lang === "en" ? "ha" : "en")}
          className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold uppercase text-content-muted hover:bg-surface-2"
          title="Toggle language"
        >
          <Languages className="h-4 w-4" />
          {lang}
        </button>
        <button
          onClick={toggle}
          className="rounded-lg border border-line p-2 text-content-muted hover:bg-surface-2"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-content-muted hover:bg-surface-2"
          title={t("nav.logout")}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t("nav.logout")}</span>
        </button>
      </div>
    </header>
  );
}
