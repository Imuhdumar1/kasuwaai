"use server";

import { revalidatePath } from "next/cache";
import { createClient, getBusiness } from "@/lib/supabase/server";

export type ActionResult = { ok?: true; error?: string; id?: string };

function s(fd: FormData, k: string): string | null {
  const v = fd.get(k);
  if (v == null) return null;
  const t = String(v).trim();
  return t === "" ? null : t;
}
function n(fd: FormData, k: string): number {
  const v = Number(fd.get(k));
  return Number.isFinite(v) ? v : 0;
}

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
  } else {
    const { data, error } = await supabase.from("products").insert(payload).select("id").single();
    if (error) return { error: error.message };
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
  const { error } = await supabase.from("products").delete().eq("id", id).eq("business_id", business.id);
  if (error) return { error: error.message };
  revalidatePath("/products");
  return { ok: true };
}
