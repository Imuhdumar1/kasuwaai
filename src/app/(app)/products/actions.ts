"use server";

import { revalidatePath } from "next/cache";
import { createClient, getBusiness } from "@/lib/supabase/server";
import { cleanText, cleanNumber } from "@/lib/sanitize";
import { logActivity } from "@/lib/activity";

export type ActionResult = { ok?: true; error?: string; id?: string };

const actorOf = (b: { owner_name: string | null; email: string | null }) => b.owner_name || b.email || null;

const s = (fd: FormData, k: string, max = 500) => cleanText(fd.get(k), max);
const n = (fd: FormData, k: string) => cleanNumber(fd.get(k), { min: 0, max: 1e12 });

export async function saveProduct(fd: FormData): Promise<ActionResult> {
  const business = await getBusiness();
  if (!business) return { error: "Not authenticated" };
  const supabase = createClient();

  const name = s(fd, "name");
  if (!name) return { error: "Product name is required" };

  const payload = {
    business_id: business.id,
    name,
    category: s(fd, "category"),
    sku: s(fd, "sku"),
    barcode: s(fd, "barcode"),
    cost_price: n(fd, "cost_price"),
    selling_price: n(fd, "selling_price"),
    stock_quantity: n(fd, "stock_quantity"),
    unit: s(fd, "unit") ?? "unit",
    description: s(fd, "description"),
  };

  const id = s(fd, "id");
  if (id) {
    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .eq("business_id", business.id);
    if (error) return { error: error.message };
    await logActivity(business.id, actorOf(business), { action: "update", entityType: "product", entityId: id, summary: `Edited product ${name}` });
  } else {
    const { data, error } = await supabase.from("products").insert(payload).select("id").single();
    if (error) return { error: error.message };
    await logActivity(business.id, actorOf(business), { action: "create", entityType: "product", entityId: data?.id, summary: `Added product ${name}` });
    revalidatePath("/products");
    return { ok: true, id: data?.id };
  }

  revalidatePath("/products");
  return { ok: true, id };
}

export async function setProductArchived(id: string, archived: boolean): Promise<ActionResult> {
  const business = await getBusiness();
  if (!business) return { error: "Not authenticated" };
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update({ status: archived ? "archived" : "active" })
    .eq("id", id)
    .eq("business_id", business.id);
  if (error) return { error: error.message };
  revalidatePath("/products");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const business = await getBusiness();
  if (!business) return { error: "Not authenticated" };
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("products")
    .select("name")
    .eq("id", id)
    .eq("business_id", business.id)
    .single();
  const { error } = await supabase.from("products").delete().eq("id", id).eq("business_id", business.id);
  if (error) return { error: error.message };
  await logActivity(business.id, actorOf(business), { action: "delete", entityType: "product", entityId: id, summary: `Deleted product ${existing?.name ?? ""}`.trim() });
  revalidatePath("/products");
  return { ok: true };
}
