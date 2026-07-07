"use server";

import { revalidatePath } from "next/cache";
import { createClient, getBusiness } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

export type ActionResult = { ok?: true; error?: string; paymentId?: string };

const actorOf = (b: { owner_name: string | null; email: string | null }) => b.owner_name || b.email || null;

export type PaymentInput = {
  sale_id: string;
  amount: number;
  method: string | null;
  reference_number: string | null;
  payment_date: string | null;
  notes: string | null;
};

const round = (n: number) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export async function recordPayment(input: PaymentInput): Promise<ActionResult> {
  const business = await getBusiness();
  if (!business) return { error: "Not authenticated" };
  const supabase = createClient();

  const { data: sale } = await supabase
    .from("sales")
    .select("id, outstanding_balance, customer_id")
    .eq("id", input.sale_id)
    .eq("business_id", business.id)
    .single();
  if (!sale) return { error: "Sale not found" };

  const amount = round(input.amount);
  if (!(amount > 0)) return { error: "Enter a payment amount." };
  if (amount > sale.outstanding_balance + 0.005) {
    return { error: "Payment cannot be more than the outstanding balance." };
  }

  const { data: inserted, error } = await supabase
    .from("payments")
    .insert({
      business_id: business.id,
      sale_id: sale.id,
      customer_id: sale.customer_id,
      amount,
      method: input.method || "Cash",
      reference_number: input.reference_number,
      payment_date: input.payment_date || new Date().toISOString(),
      notes: input.notes,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  // Thread payment activity under the sale (entity_id = sale.id) so it shows in
  // the sale's edit history. "settle" when it clears the balance, else a payment.
  const clears = amount >= sale.outstanding_balance - 0.005;
  await logActivity(business.id, actorOf(business), {
    action: clears ? "settle" : "create",
    entityType: "payment",
    entityId: sale.id,
    summary: `${clears ? "Settled debt" : "Recorded payment"} — ${business.currency} ${amount}`,
  });

  revalidatePath("/debts");
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  revalidatePath("/sales");
  revalidatePath(`/sales/${sale.id}`);
  if (sale.customer_id) revalidatePath(`/customers/${sale.customer_id}`);
  return { ok: true, paymentId: inserted?.id };
}

export async function deletePayment(id: string): Promise<ActionResult> {
  const business = await getBusiness();
  if (!business) return { error: "Not authenticated" };
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("payments")
    .select("amount, sale_id")
    .eq("id", id)
    .eq("business_id", business.id)
    .single();
  const { error } = await supabase.from("payments").delete().eq("id", id).eq("business_id", business.id);
  if (error) return { error: error.message };
  await logActivity(business.id, actorOf(business), {
    action: "delete",
    entityType: "payment",
    entityId: existing?.sale_id ?? null,
    summary: existing ? `Removed payment — ${business.currency} ${existing.amount}` : "Removed a payment",
  });
  revalidatePath("/payments");
  revalidatePath("/debts");
  revalidatePath("/dashboard");
  return { ok: true };
}
