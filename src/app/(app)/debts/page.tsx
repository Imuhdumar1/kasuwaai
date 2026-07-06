import { createClient, getBusiness } from "@/lib/supabase/server";
import { DebtsView, type DebtRow } from "@/components/debts/debts-view";

export const dynamic = "force-dynamic";

type CustomerJoin = { full_name: string; phone: string | null; whatsapp: string | null };

export default async function DebtsPage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const { data } = await supabase
    .from("sales")
    .select(
      "id, customer_id, total_amount, amount_paid, outstanding_balance, status, due_date, customer:customers(full_name, phone, whatsapp)",
    )
    .eq("business_id", business.id)
    .gt("outstanding_balance", 0)
    .order("due_date", { ascending: true, nullsFirst: false });

  const rows: DebtRow[] = (data ?? []).map((s) => {
    const cust = s.customer as CustomerJoin | CustomerJoin[] | null;
    const c = Array.isArray(cust) ? cust[0] ?? null : cust;
    return {
      id: s.id,
      customer_id: s.customer_id,
      customer_name: c?.full_name ?? null,
      phone: c?.phone ?? null,
      whatsapp: c?.whatsapp ?? null,
      total_amount: s.total_amount,
      amount_paid: s.amount_paid,
      outstanding_balance: s.outstanding_balance,
      status: s.status,
      due_date: s.due_date,
    };
  });

  return <DebtsView rows={rows} currency={business.currency} businessName={business.business_name} />;
}
