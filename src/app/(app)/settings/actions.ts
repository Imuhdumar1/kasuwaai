"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUserId } from "@/lib/supabase/server";

export type ActionResult = { ok?: true; error?: string };

function s(fd: FormData, k: string): string | null {
  const v = fd.get(k);
  if (v == null) return null;
  const t = String(v).trim();
  return t === "" ? null : t;
}

export async function updateBusiness(fd: FormData): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { error: "Not authenticated" };
  const supabase = createClient();

  const payload: Record<string, unknown> = {
    business_name: s(fd, "business_name") ?? "My Business",
    owner_name: s(fd, "owner_name"),
    phone: s(fd, "phone"),
    email: s(fd, "email"),
    business_category: s(fd, "business_category"),
    market_location: s(fd, "market_location"),
    state: s(fd, "state"),
    lga: s(fd, "lga"),
    logo_url: s(fd, "logo_url"),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("businesses").update(payload).eq("user_id", userId);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updatePreferences(prefs: {
  currency?: string;
  language?: string;
  notification_settings?: Record<string, boolean>;
}): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { error: "Not authenticated" };
  const supabase = createClient();
  const { error } = await supabase
    .from("businesses")
    .update({ ...prefs, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Deletes all of the user's business data (cascades to every record). */
export async function deleteAllData(): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { error: "Not authenticated" };
  const supabase = createClient();
  const { error } = await supabase.from("businesses").delete().eq("user_id", userId);
  if (error) return { error: error.message };
  return { ok: true };
}
