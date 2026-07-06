"use server";

import { revalidatePath } from "next/cache";
import { createClient, getBusiness } from "@/lib/supabase/server";
import { cleanText, cleanNumber } from "@/lib/sanitize";

export type ActionResult = { ok?: true; error?: string; id?: string };

const s = (fd: FormData, k: string, max = 500) => cleanText(fd.get(k), max);
const n = (fd: FormData, k: string) => cleanNumber(fd.get(k), { min: 0, max: 1e12 });

export async function saveCustomer(fd: FormData): Promise<ActionResult> {
  const business = await getBusiness();
  if (!business) return { error: "Not authenticated" };
  const supabase = createClient();

  const full_name = s(fd, "full_name");
  if (!full_name) return { error: "Full name is required" };

  const payload = {
    business_id: business.id,
    full_name,
    nickname: s(fd, "nickname"),
    phone: s(fd, "phone"),
    whatsapp: s(fd, "whatsapp"),
    email: s(fd, "email"),
    gender: s(fd, "gender"),
    address: s(fd, "address"),
    market: s(fd, "market"),
    business_type: s(fd, "business_type"),
    preferred_language: s(fd, "preferred_language"),
    credit_limit: n(fd, "credit_limit"),
    notes: s(fd, "notes"),
  };

  const id = s(fd, "id");
  if (id) {
    const { error } = await supabase
      .from("customers")
      .update(payload)
      .eq("id", id)
      .eq("business_id", business.id);
    if (error) return { error: error.message };
    revalidatePath(`/customers/${id}`);
  } else {
    const { data, error } = await supabase.from("customers").insert(payload).select("id").single();
    if (error) return { error: error.message };
    revalidatePath("/customers");
    revalidatePath("/dashboard");
    return { ok: true, id: data?.id };
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return { ok: true, id };
}

export async function setCustomerArchived(id: string, archived: boolean): Promise<ActionResult> {
  const business = await getBusiness();
  if (!business) return { error: "Not authenticated" };
  const supabase = createClient();
  const { error } = await supabase
    .from("customers")
    .update({ status: archived ? "archived" : "active" })
    .eq("id", id)
    .eq("business_id", business.id);
  if (error) return { error: error.message };
  revalidatePath("/customers");
  return { ok: true };
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const business = await getBusiness();
  if (!business) return { error: "Not authenticated" };
  const supabase = createClient();
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .eq("business_id", business.id);
  if (error) return { error: error.message };
  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return { ok: true };
}
