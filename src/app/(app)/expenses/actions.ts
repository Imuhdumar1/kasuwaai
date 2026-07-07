"use server";

import { revalidatePath } from "next/cache";
import { createClient, getBusiness } from "@/lib/supabase/server";
import { cleanText, cleanNumber } from "@/lib/sanitize";

export type ActionResult = { ok?: true; error?: string; id?: string };

const s = (fd: FormData, k: string, max = 500) => cleanText(fd.get(k), max);
const n = (fd: FormData, k: string) => cleanNumber(fd.get(k), { min: 0, max: 1e12 });

/** Normalise a date input to YYYY-MM-DD, defaulting to today. */
function cleanDate(v: FormDataEntryValue | null): string {
  const raw = typeof v === "string" ? v.trim() : "";
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : new Date().toISOString().slice(0, 10);
}

export async function saveExpense(fd: FormData): Promise<ActionResult> {
  const business = await getBusiness();
  if (!business) return { error: "Not authenticated" };
  const supabase = createClient();

  const amount = n(fd, "amount");
  if (!amount || amount <= 0) return { error: "Enter an amount greater than zero" };

  const payload = {
    business_id: business.id,
    amount,
    category: s(fd, "category"),
    description: s(fd, "description"),
    expense_date: cleanDate(fd.get("expense_date")),
  };

  const id = s(fd, "id");
  if (id) {
    const { error } = await supabase
      .from("expenses")
      .update(payload)
      .eq("id", id)
      .eq("business_id", business.id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase.from("expenses").insert(payload).select("id").single();
    if (error) return { error: error.message };
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { ok: true, id: data?.id };
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { ok: true, id };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const business = await getBusiness();
  if (!business) return { error: "Not authenticated" };
  const supabase = createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id).eq("business_id", business.id);
  if (error) return { error: error.message };
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { ok: true };
}
