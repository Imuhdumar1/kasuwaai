import { createClient, getBusiness } from "@/lib/supabase/server";
import { ProductsView, type ProductRow } from "@/components/products/products-view";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const business = (await getBusiness())!;
  const supabase = createClient();

  const [prodRes, itemsRes] = await Promise.all([
    supabase.from("products").select("*").eq("business_id", business.id).order("created_at", { ascending: false }),
    supabase
      .from("sale_items")
      .select("product_id, quantity, line_total, sales!inner(business_id)")
      .eq("sales.business_id", business.id),
  ]);

  const products = (prodRes.data ?? []) as Product[];
  const items = (itemsRes.data ?? []) as { product_id: string | null; quantity: number; line_total: number }[];

  const agg = new Map<string, { soldQty: number; revenue: number }>();
  for (const it of items) {
    if (!it.product_id) continue;
    const cur = agg.get(it.product_id) ?? { soldQty: 0, revenue: 0 };
    cur.soldQty += Number(it.quantity);
    cur.revenue += Number(it.line_total);
    agg.set(it.product_id, cur);
  }

  const rows: ProductRow[] = products.map((p) => ({
    ...p,
    ...(agg.get(p.id) ?? { soldQty: 0, revenue: 0 }),
  }));

  return <ProductsView rows={rows} currency={business.currency} />;
}
