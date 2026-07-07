import { createClient, getBusiness } from "@/lib/supabase/server";
import {
  computeDashboard,
  topCustomers,
  bestProducts,
  recommendations,
  debtStatus,
  type SaleForCalc,
} from "@/lib/calc";
import { relativeDueLabel } from "@/lib/format";
import { AssistantChat } from "@/components/assistant/assistant-chat";
import type { AssistantSnapshot } from "@/lib/assistant/answer";
import type { Payment } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const [salesRes, paymentsRes, expensesRes, custCount, prodCount] = await Promise.all([
    supabase.from("sales").select("*, sale_items(*), customer:customers(id, full_name)").eq("business_id", business.id),
    supabase.from("payments").select("*").eq("business_id", business.id),
    supabase.from("expenses").select("amount").eq("business_id", business.id),
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("status", "active"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("status", "active"),
  ]);

  const sales = (salesRes.data ?? []) as SaleForCalc[];
  const payments = (paymentsRes.data ?? []) as Payment[];
  const expenses = (expensesRes.data ?? []) as { amount: number }[];
  const stats = computeDashboard(sales, payments, expenses);
  const top = topCustomers(sales, 1)[0] ?? null;
  const best = bestProducts(sales, 1)[0] ?? null;

  const debtMap = new Map<string, { name: string; amount: number }>();
  for (const s of sales) {
    if (s.outstanding_balance > 0 && s.customer) {
      const cur = debtMap.get(s.customer.id) ?? { name: s.customer.full_name, amount: 0 };
      cur.amount += s.outstanding_balance;
      debtMap.set(s.customer.id, cur);
    }
  }
  const debtors = Array.from(debtMap.values()).sort((a, b) => b.amount - a.amount);

  const overdue = sales
    .filter((s) => debtStatus(s) === "overdue")
    .map((s) => ({ name: s.customer?.full_name ?? "Walk-in", amount: s.outstanding_balance, dueLabel: relativeDueLabel(s.due_date) }))
    .sort((a, b) => b.amount - a.amount);

  const snapshot: AssistantSnapshot = {
    currency: business.currency,
    todaySales: stats.todaySales,
    weekSales: stats.weekSales,
    monthSales: stats.monthSales,
    totalRevenue: stats.totalRevenue,
    totalProfit: stats.totalProfit,
    totalExpenses: stats.totalExpenses,
    netProfit: stats.netProfit,
    paymentsReceived: stats.paymentsReceived,
    outstandingDebt: stats.outstandingDebt,
    customerCount: custCount.count ?? 0,
    productCount: prodCount.count ?? 0,
    transactionCount: stats.transactionCount,
    overdueCount: stats.overdueCount,
    debtors,
    overdue,
    topCustomer: top ? { name: top.name, total: top.total } : null,
    bestProduct: best ? { name: best.name, qty: best.qty, revenue: best.revenue } : null,
    recommendations: recommendations(stats, sales),
    business: {
      name: business.business_name,
      owner: business.owner_name,
      phone: business.phone,
      email: business.email,
      category: business.business_category,
      market: business.market_location,
      state: business.state,
      lga: business.lga,
    },
  };

  return <AssistantChat snapshot={snapshot} />;
}
