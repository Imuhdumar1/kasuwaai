import { redirect } from "next/navigation";
import { getBusiness } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { isMaintenanceMode } from "@/lib/maintenance";
import { MaintenanceScreen } from "@/components/maintenance-screen";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const business = await getBusiness();
  if (!business) redirect("/login");
  if (isMaintenanceMode()) return <MaintenanceScreen />;
  return <AppShell business={business}>{children}</AppShell>;
}
