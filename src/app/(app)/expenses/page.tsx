import { createClient, getBusiness } from "@/lib/supabase/server";
import { ExpensesView } from "@/components/expenses/expenses-view";
import type { Expense } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const { data } = await supabase
    .from("expenses")
    .select("*")
    .eq("business_id", business.id)
    .order("expense_date", { ascending: false });

  const rows = (data ?? []) as Expense[];

  return <ExpensesView rows={rows} currency={business.currency} />;
}
