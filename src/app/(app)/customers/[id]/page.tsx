import { notFound } from "next/navigation";
import { createClient, getBusiness } from "@/lib/supabase/server";
import { CustomerDetail } from "@/components/customers/customer-detail";
import type { Customer } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CustomerPage({ params }: { params: { id: string } }) {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", params.id)
    .eq("business_id", business.id)
    .single();

  if (!customer) notFound();

  const [salesRes, paymentsRes] = await Promise.all([
    supabase
      .from("sales")
      .select("id, sale_date, total_amount, outstanding_balance, status, due_date")
      .eq("business_id", business.id)
      .eq("customer_id", params.id)
      .order("sale_date", { ascending: false }),
    supabase
      .from("payments")
      .select("id, amount, method, payment_date")
      .eq("business_id", business.id)
      .eq("customer_id", params.id)
      .order("payment_date", { ascending: false }),
  ]);

  return (
    <CustomerDetail
      customer={customer as Customer}
      sales={salesRes.data ?? []}
      payments={paymentsRes.data ?? []}
      currency={business.currency}
    />
  );
}
