"use server";

import { revalidatePath } from "next/cache";
import { createClient, getBusiness } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

export type ActionResult = { ok?: true; error?: string; id?: string };

const actorOf = (b: { owner_name: string | null; email: string | null }) => b.owner_name || b.email || null;

export type SaleItemInput = {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
};

export type SaleInput = {
  customer_id: string | null;
  items: SaleItemInput[];
  discount: number;
  tax: number;
  amount_paid: number;
  due_date: string | null;
  payment_method: string | null;
  notes: string | null;
  source?: "manual" | "voice";
};

const round = (n: number) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export async function createSale(input: SaleInput): Promise<ActionResult> {
  const business = await getBusiness();
  if (!business) return { error: "Not authenticated" };
  const supabase = createClient();

  const items = (input.items ?? []).filter(
    (it) => Number(it.quantity) > 0 && it.product_name?.trim(),
  );
  if (items.length === 0) return { error: "Add at least one item to the sale." };

  const subtotal = round(items.reduce((a, it) => a + it.quantity * it.unit_price, 0));
  const discount = round(Math.max(0, input.discount || 0));
  const tax = round(Math.max(0, input.tax || 0));
  const total = round(Math.max(0, subtotal - discount + tax));
  const profit = round(
    items.reduce((a, it) => a + (it.unit_price - it.cost_price) * it.quantity, 0) - discount,
  );
  const paid = round(clamp(input.amount_paid || 0, 0, total));

  const { data: sale, error } = await supabase
    .from("sales")
    .insert({
      business_id: business.id,
      customer_id: input.customer_id || null,
      subtotal,
      discount,
      tax,
      total_amount: total,
      amount_paid: 0,
      outstanding_balance: total,
      profit,
      payment_method: input.payment_method || null,
      due_date: input.due_date || null,
      notes: input.notes || null,
      status: "unpaid",
      source: input.source ?? "manual",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  const saleId = sale!.id as string;

  const itemRows = items.map((it) => ({
    sale_id: saleId,
    product_id: it.product_id || null,
    product_name: it.product_name.trim(),
    quantity: round(it.quantity),
    unit_price: round(it.unit_price),
    cost_price: round(it.cost_price),
    line_total: round(it.quantity * it.unit_price),
  }));
  const { error: itemsErr } = await supabase.from("sale_items").insert(itemRows);
  if (itemsErr) return { error: itemsErr.message };

  // The initial down-payment becomes a payment row; a DB trigger then
  // recomputes amount_paid / outstanding_balance / status on the sale.
  if (paid > 0) {
    const { error: payErr } = await supabase.from("payments").insert({
      business_id: business.id,
      sale_id: saleId,
      customer_id: input.customer_id || null,
      amount: paid,
      method: input.payment_method || "Cash",
      notes: "Payment at time of sale",
    });
    if (payErr) return { error: payErr.message };
  }

  await logActivity(business.id, actorOf(business), {
    action: "create",
    entityType: "sale",
    entityId: saleId,
    summary: `Recorded sale — ${business.currency} ${total}${input.source === "voice" ? " (voice)" : ""}`,
  });

  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/debts");
  revalidatePath("/payments");
  if (input.customer_id) revalidatePath(`/customers/${input.customer_id}`);
  return { ok: true, id: saleId };
}

export async function deleteSale(id: string): Promise<ActionResult> {
  const business = await getBusiness();
  if (!business) return { error: "Not authenticated" };
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("sales")
    .select("total_amount")
    .eq("id", id)
    .eq("business_id", business.id)
    .single();
  const { error } = await supabase.from("sales").delete().eq("id", id).eq("business_id", business.id);
  if (error) return { error: error.message };
  await logActivity(business.id, actorOf(business), {
    action: "delete",
    entityType: "sale",
    entityId: id,
    summary: existing ? `Deleted sale — ${business.currency} ${existing.total_amount}` : "Deleted a sale",
  });
  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/debts");
  return { ok: true };
}
