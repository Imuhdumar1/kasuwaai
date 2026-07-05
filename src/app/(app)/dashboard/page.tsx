import { createClient, getBusiness } from "@/lib/supabase/server";
import {
  computeDashboard,
  salesTrend,
  topCustomers,
  bestProducts,
  recommendations,
  type SaleForCalc,
} from "@/lib/calc";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import type { Payment } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const [salesRes, paymentsRes, custCount, prodCount] = await Promise.all([
    supabase
      .from("sales")
      .select("*, sale_items(*), customer:customers(id, full_name)")
      .eq("business_id", business.id)
      .order("sale_date", { ascending: false }),
    supabase
      .from("payments")
      .select("*, customer:customers(full_name)")
      .eq("business_id", business.id)
      .order("payment_date", { ascending: false }),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("status", "active"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("status", "active"),
  ]);

  const sales = (salesRes.data ?? []) as SaleForCalc[];
  const payments = (paymentsRes.data ?? []) as (Payment & { customer?: { full_name: string } | null })[];

  const stats = computeDashboard(sales, payments);
  const trend = salesTrend(sales, 7);
  const tops = topCustomers(sales, 5);
  const best = bestProducts(sales, 5);
  const recs = recommendations(stats, sales);

  const recent = [
    ...sales.slice(0, 10).map((s) => ({
      id: s.id,
      kind: "sale" as const,
      name: s.customer?.full_name ?? "Walk-in customer",
      amount: s.total_amount,
      date: s.sale_date,
      status: s.status as string,
    })),
    ...payments.slice(0, 10).map((p) => ({
      id: p.id,
      kind: "payment" as const,
      name: p.customer?.full_name ?? "Payment",
      amount: p.amount,
      date: p.payment_date,
      status: undefined as string | undefined,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <DashboardView
      businessName={business.business_name}
      currency={business.currency}
      stats={stats}
      trend={trend}
      topCustomers={tops}
      bestProducts={best}
      recommendations={recs}
      recent={recent}
      counts={{ customers: custCount.count ?? 0, products: prodCount.count ?? 0 }}
    />
  );
}
