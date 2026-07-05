import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient, getBusiness } from "@/lib/supabase/server";
import { SaleForm } from "@/components/sales/sale-form";

export const dynamic = "force-dynamic";

export default async function NewSalePage({ searchParams }: { searchParams: { customer?: string } }) {
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

  return (
    <div className="animate-fade-up">
      <Link href="/sales" className="mb-4 inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-content">
        <ArrowLeft className="h-4 w-4" /> {" "}Sales
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">New Sale</h1>
      <SaleForm
        customers={custRes.data ?? []}
        products={prodRes.data ?? []}
        currency={business.currency}
        prefillCustomerId={searchParams.customer}
      />
    </div>
  );
}
