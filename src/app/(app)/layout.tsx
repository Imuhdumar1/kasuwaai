import { redirect } from "next/navigation";
import { getBusiness } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const business = await getBusiness();
  if (!business) redirect("/login");
  return <AppShell business={business}>{children}</AppShell>;
}
