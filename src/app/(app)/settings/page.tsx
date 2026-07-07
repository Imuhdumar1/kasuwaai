import { createClient, getBusiness } from "@/lib/supabase/server";
import { SettingsView } from "@/components/settings/settings-view";
import type { ActivityRow } from "@/components/history/activity-log";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const { data } = await supabase
    .from("activity_log")
    .select("id, actor, action, entity_type, entity_id, summary, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(200);

  return <SettingsView business={business} activity={(data ?? []) as ActivityRow[]} />;
}
