import { notFound } from "next/navigation";
import { createClient, getBusiness } from "@/lib/supabase/server";
import { SaleDetail } from "@/components/sales/sale-detail";
import type { Sale, SaleItem, Payment } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SalePage({ params }: { params: { id: string } }) {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const { data: sale } = await supabase
    .from("sales")
    .select("*, customer:customers(id, full_name), sale_items(*)")
    .eq("id", params.id)
    .eq("business_id", business.id)
    .single();

  if (!sale) notFound();

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("sale_id", params.id)
    .order("payment_date", { ascending: false });

  const cust = sale.customer as { id: string; full_name: string } | { id: string; full_name: string }[] | null;
  const customer = Array.isArray(cust) ? (cust[0] ?? null) : cust;

  return (
    <SaleDetail
      sale={sale as Sale}
      items={(sale.sale_items ?? []) as SaleItem[]}
      payments={(payments ?? []) as Payment[]}
      customer={customer}
      currency={business.currency}
    />
  );
}
