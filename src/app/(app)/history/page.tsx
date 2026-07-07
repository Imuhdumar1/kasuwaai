import { createClient, getBusiness } from "@/lib/supabase/server";
import { HistoryView, type ActivityRow } from "@/components/history/history-view";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const { data } = await supabase
    .from("activity_log")
    .select("id, actor, action, entity_type, entity_id, summary, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(200);

  return <HistoryView rows={(data ?? []) as ActivityRow[]} />;
}
