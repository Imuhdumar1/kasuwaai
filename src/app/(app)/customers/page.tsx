import { createClient, getBusiness } from "@/lib/supabase/server";
import { CustomersView, type CustomerRow } from "@/components/customers/customers-view";
import type { Customer } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const [custRes, salesRes] = await Promise.all([
    supabase.from("customers").select("*").eq("business_id", business.id).order("created_at", { ascending: false }),
    supabase.from("sales").select("customer_id, total_amount, outstanding_balance").eq("business_id", business.id),
  ]);

  const customers = (custRes.data ?? []) as Customer[];
  const sales = salesRes.data ?? [];

  const agg = new Map<string, { owing: number; totalSpent: number; txCount: number }>();
  for (const s of sales) {
    if (!s.customer_id) continue;
    const cur = agg.get(s.customer_id) ?? { owing: 0, totalSpent: 0, txCount: 0 };
    cur.owing += Number(s.outstanding_balance);
    cur.totalSpent += Number(s.total_amount);
    cur.txCount += 1;
    agg.set(s.customer_id, cur);
  }

  const rows: CustomerRow[] = customers.map((c) => ({
    ...c,
    ...(agg.get(c.id) ?? { owing: 0, totalSpent: 0, txCount: 0 }),
  }));

  return <CustomersView rows={rows} currency={business.currency} />;
}
