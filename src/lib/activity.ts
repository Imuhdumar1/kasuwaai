import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ActivityAction = "create" | "update" | "delete" | "settle" | "restore";
export type ActivityEntity = "customer" | "product" | "sale" | "payment" | "expense";

type Entry = {
  action: ActivityAction;
  entityType: ActivityEntity;
  entityId?: string | null;
  summary: string;
};

/**
 * Append one entry to the immutable activity log. Best-effort: logging must
 * never break the primary action (e.g. if the migration hasn't been run yet),
 * so any failure is swallowed.
 */
export async function logActivity(businessId: string, actor: string | null, entry: Entry): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from("activity_log").insert({
      business_id: businessId,
      actor,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      summary: entry.summary,
    });
  } catch {
    /* no-op — never surface logging errors to the user */
  }
}
