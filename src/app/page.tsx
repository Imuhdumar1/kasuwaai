import { Landing } from "@/components/landing";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "KasuwaAI — Sales & Debt Tracking for Your Business",
  description:
    "Turn your notebook into a simple digital record. Track sales, customers, debts and payments, record sales by voice in English or Hausa, and never forget who owes you money.",
};

export default async function Page() {
  // Auth-aware CTAs: a logged-in visitor should see "Go to dashboard", not
  // "Get started free" / "Log in" (which would just bounce them anyway).
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <Landing authed={!!user} />;
}
