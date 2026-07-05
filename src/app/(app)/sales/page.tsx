import { createClient, getBusiness } from "@/lib/supabase/server";
import { SalesView, type SaleRow } from "@/components/sales/sales-view";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const { data } = await supabase
    .from("sales")
    .select("id, sale_date, total_amount, amount_paid, outstanding_balance, status, customer:customers(full_name)")
    .eq("business_id", business.id)
    .order("sale_date", { ascending: false });

  const rows: SaleRow[] = (data ?? []).map((s) => {
    const cust = s.customer as { full_name: string } | { full_name: string }[] | null;
    const customer_name = Array.isArray(cust) ? (cust[0]?.full_name ?? null) : (cust?.full_name ?? null);
    return {
      id: s.id,
      sale_date: s.sale_date,
      customer_name,
      total_amount: s.total_amount,
      amount_paid: s.amount_paid,
      outstanding_balance: s.outstanding_balance,
      status: s.status,
    };
  });

  return <SalesView rows={rows} currency={business.currency} />;
}
