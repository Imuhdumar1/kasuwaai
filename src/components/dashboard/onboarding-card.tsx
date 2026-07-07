import Link from "next/link";
import { Check, Package, Users, ShoppingCart, Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui";

export function OnboardingCard({
  businessName,
  hasProducts,
  hasCustomers,
}: {
  businessName: string;
  hasProducts: boolean;
  hasCustomers: boolean;
}) {
  const steps = [
    { done: hasProducts, icon: Package, title: "Add your first product", body: "The items you sell, with their prices.", href: "/products", cta: "Add product" },
    { done: hasCustomers, icon: Users, title: "Add a customer", body: "The people you sell to — so you can track their debts.", href: "/customers", cta: "Add customer" },
    { done: false, icon: ShoppingCart, title: "Record your first sale", body: "Type it or record it by voice — your dashboard comes to life.", href: "/sales/new", cta: "Record a sale" },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <Card className="mb-4 overflow-hidden border-lime/40">
      <div className="flex items-center gap-2.5 border-b border-line bg-lime/[0.06] p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime/25 text-ink">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display font-bold">
            Welcome{businessName ? `, ${businessName}` : ""}! 👋
          </h3>
          <p className="text-xs text-content-muted">Set up your shop in 3 quick steps · {doneCount}/3 done</p>
        </div>
      </div>
      <ul className="divide-y divide-line">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-3 p-4 sm:gap-4">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                s.done ? "bg-success/15 text-success" : "bg-surface-2 text-content-muted"
              }`}
            >
              {s.done ? <Check className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className={`font-medium ${s.done ? "text-content-muted line-through" : ""}`}>{s.title}</div>
              <div className="text-xs text-content-muted">{s.body}</div>
            </div>
            {!s.done && (
              <Link
                href={s.href}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-paper transition-colors hover:bg-ink/90"
              >
                {s.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
