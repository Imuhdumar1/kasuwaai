import { createClient, getBusiness } from "@/lib/supabase/server";
import { DebtsView, type DebtRow, type SettledRow } from "@/components/debts/debts-view";

export const dynamic = "force-dynamic";

type CustomerJoin = { full_name: string; phone: string | null; whatsapp: string | null };

function custName(c: unknown): string | null {
  const v = c as { full_name: string } | { full_name: string }[] | null;
  return Array.isArray(v) ? (v[0]?.full_name ?? null) : (v?.full_name ?? null);
}

export default async function DebtsPage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const [openRes, paidRes, paymentsRes] = await Promise.all([
    // Open debts: sales still carrying a balance.
    supabase
      .from("sales")
      .select(
        "id, customer_id, total_amount, amount_paid, outstanding_balance, status, due_date, customer:customers(full_name, phone, whatsapp)",
      )
      .eq("business_id", business.id)
      .gt("outstanding_balance", 0)
      .order("due_date", { ascending: true, nullsFirst: false }),
    // Candidates for "settled debts": sales now fully paid.
    supabase
      .from("sales")
      .select("id, total_amount, due_date, sale_date, customer:customers(full_name)")
      .eq("business_id", business.id)
      .eq("status", "paid")
      .order("sale_date", { ascending: false })
      .limit(200),
    // Payments, to tell a real (credit) debt from a one-shot cash sale.
    supabase.from("payments").select("sale_id, payment_date").eq("business_id", business.id),
  ]);

  const rows: DebtRow[] = (openRes.data ?? []).map((s) => {
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

  // Count payments per sale + track the latest payment date (= when it was settled).
  const payAgg = new Map<string, { count: number; last: string }>();
  for (const p of paymentsRes.data ?? []) {
    if (!p.sale_id) continue;
    const cur = payAgg.get(p.sale_id) ?? { count: 0, last: p.payment_date };
    cur.count += 1;
    if (new Date(p.payment_date) > new Date(cur.last)) cur.last = p.payment_date;
    payAgg.set(p.sale_id, cur);
  }

  // A settled debt was genuinely credit: it had a due date, or it was cleared in
  // 2+ payment events (a down-payment plus later settlement). This excludes
  // ordinary cash sales that were paid in full at the counter.
  const settled: SettledRow[] = (paidRes.data ?? [])
    .filter((s) => s.due_date != null || (payAgg.get(s.id)?.count ?? 0) >= 2)
    .map((s) => ({
      id: s.id,
      customer_name: custName(s.customer),
      total_amount: s.total_amount,
      settled_date: payAgg.get(s.id)?.last ?? s.sale_date,
    }))
    .sort((a, b) => new Date(b.settled_date).getTime() - new Date(a.settled_date).getTime())
    .slice(0, 50);

  return (
    <DebtsView rows={rows} settled={settled} currency={business.currency} businessName={business.business_name} />
  );
}
