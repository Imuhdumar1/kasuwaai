import { createClient, getBusiness } from "@/lib/supabase/server";
import { ReportsView, type ReportSale, type ReportPayment } from "@/components/reports/reports-view";

export const dynamic = "force-dynamic";

function name(c: unknown): string | null {
  const v = c as { full_name: string } | { full_name: string }[] | null;
  return Array.isArray(v) ? (v[0]?.full_name ?? null) : (v?.full_name ?? null);
}

export default async function ReportsPage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const [salesRes, paymentsRes] = await Promise.all([
    supabase
      .from("sales")
      .select("id, sale_date, total_amount, amount_paid, outstanding_balance, status, due_date, profit, customer:customers(full_name), sale_items(product_name, quantity, line_total, cost_price)")
      .eq("business_id", business.id)
      .order("sale_date", { ascending: false }),
    supabase
      .from("payments")
      .select("id, payment_date, amount, method, reference_number, customer:customers(full_name)")
      .eq("business_id", business.id)
      .order("payment_date", { ascending: false }),
  ]);

  const sales: ReportSale[] = (salesRes.data ?? []).map((s) => ({
    id: s.id,
    sale_date: s.sale_date,
    customer_name: name(s.customer),
    total_amount: s.total_amount,
    amount_paid: s.amount_paid,
    outstanding_balance: s.outstanding_balance,
    status: s.status,
    due_date: s.due_date,
    profit: s.profit,
    items: (s.sale_items ?? []) as ReportSale["items"],
  }));

  const payments: ReportPayment[] = (paymentsRes.data ?? []).map((p) => ({
    id: p.id,
    payment_date: p.payment_date,
    customer_name: name(p.customer),
    amount: p.amount,
    method: p.method,
    reference_number: p.reference_number,
  }));

  return <ReportsView sales={sales} payments={payments} currency={business.currency} businessName={business.business_name} />;
}
