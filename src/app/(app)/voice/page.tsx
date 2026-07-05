import { createClient, getBusiness } from "@/lib/supabase/server";
import { VoiceSale } from "@/components/voice/voice-sale";

export const dynamic = "force-dynamic";

export default async function VoicePage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const [custRes, prodRes] = await Promise.all([
    supabase.from("customers").select("id, full_name").eq("business_id", business.id).eq("status", "active").order("full_name"),
    supabase
      .from("products")
      .select("id, name, selling_price, cost_price, unit")
      .eq("business_id", business.id)
      .eq("status", "active")
      .order("name"),
  ]);

  return <VoiceSale customers={custRes.data ?? []} products={prodRes.data ?? []} currency={business.currency} />;
}
