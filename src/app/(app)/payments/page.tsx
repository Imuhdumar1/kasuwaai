import { createClient, getBusiness } from "@/lib/supabase/server";
import { PaymentsView, type PaymentRow, type OpenDebt } from "@/components/payments/payments-view";

export const dynamic = "force-dynamic";

function name(c: unknown): string | null {
  const v = c as { full_name: string } | { full_name: string }[] | null;
  return Array.isArray(v) ? (v[0]?.full_name ?? null) : (v?.full_name ?? null);
}

export default async function PaymentsPage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const [paymentsRes, debtsRes] = await Promise.all([
    supabase
      .from("payments")
      .select("id, amount, method, reference_number, payment_date, sale_id, customer:customers(full_name)")
      .eq("business_id", business.id)
      .order("payment_date", { ascending: false }),
    supabase
      .from("sales")
      .select("id, outstanding_balance, sale_date, customer:customers(full_name)")
      .eq("business_id", business.id)
      .gt("outstanding_balance", 0)
      .order("due_date", { ascending: true, nullsFirst: false }),
  ]);

  const rows: PaymentRow[] = (paymentsRes.data ?? []).map((p) => ({
    id: p.id,
    amount: p.amount,
    method: p.method,
    reference_number: p.reference_number,
    payment_date: p.payment_date,
    customer_name: name(p.customer),
    sale_id: p.sale_id,
  }));

  const openDebts: OpenDebt[] = (debtsRes.data ?? []).map((s) => ({
    id: s.id,
    customer_name: name(s.customer),
    outstanding_balance: s.outstanding_balance,
  }));

  return <PaymentsView rows={rows} openDebts={openDebts} currency={business.currency} />;
}
