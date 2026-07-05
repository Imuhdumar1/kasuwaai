import { getBusiness } from "@/lib/supabase/server";
import { SettingsView } from "@/components/settings/settings-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const business = (await getBusiness())!;
  return <SettingsView business={business} />;
}
