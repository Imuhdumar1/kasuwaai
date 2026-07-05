import { createClient, getBusiness } from "@/lib/supabase/server";
import { PaymentsView, type PaymentRow } from "@/components/payments/payments-view";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const { data } = await supabase
    .from("payments")
    .select("id, amount, method, reference_number, payment_date, sale_id, customer:customers(full_name)")
    .eq("business_id", business.id)
    .order("payment_date", { ascending: false });

  const rows: PaymentRow[] = (data ?? []).map((p) => {
    const cust = p.customer as { full_name: string } | { full_name: string }[] | null;
    const customer_name = Array.isArray(cust) ? (cust[0]?.full_name ?? null) : (cust?.full_name ?? null);
    return {
      id: p.id,
      amount: p.amount,
      method: p.method,
      reference_number: p.reference_number,
      payment_date: p.payment_date,
      customer_name,
      sale_id: p.sale_id,
    };
  });

  return <PaymentsView rows={rows} currency={business.currency} />;
}
