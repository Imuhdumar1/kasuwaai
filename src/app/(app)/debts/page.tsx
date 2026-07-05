import { createClient, getBusiness } from "@/lib/supabase/server";
import { DebtsView, type DebtRow } from "@/components/debts/debts-view";

export const dynamic = "force-dynamic";

export default async function DebtsPage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const { data } = await supabase
    .from("sales")
    .select("id, customer_id, total_amount, amount_paid, outstanding_balance, status, due_date, customer:customers(full_name)")
    .eq("business_id", business.id)
    .gt("outstanding_balance", 0)
    .order("due_date", { ascending: true, nullsFirst: false });

  const rows: DebtRow[] = (data ?? []).map((s) => {
    const cust = s.customer as { full_name: string } | { full_name: string }[] | null;
    const customer_name = Array.isArray(cust) ? (cust[0]?.full_name ?? null) : (cust?.full_name ?? null);
    return {
      id: s.id,
      customer_id: s.customer_id,
      customer_name,
      total_amount: s.total_amount,
      amount_paid: s.amount_paid,
      outstanding_balance: s.outstanding_balance,
      status: s.status,
      due_date: s.due_date,
    };
  });

  return <DebtsView rows={rows} currency={business.currency} />;
}
