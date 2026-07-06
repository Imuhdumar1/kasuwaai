import { formatMoney, formatDate } from "@/lib/format";

/** Build a plain-text receipt for sharing via the native share sheet / WhatsApp / copy. */
export function buildReceipt(o: {
  businessName: string;
  customerName: string | null;
  date: string;
  items: { name: string; quantity: number; lineTotal: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
  currency: string;
}): string {
  const m = (n: number) => formatMoney(n, o.currency);
  const lines: string[] = [];
  lines.push(o.businessName);
  lines.push(`Receipt · ${formatDate(o.date)}`);
  if (o.customerName) lines.push(`Customer: ${o.customerName}`);
  lines.push("--------------------------------");
  for (const it of o.items) lines.push(`${it.quantity} x ${it.name}  —  ${m(it.lineTotal)}`);
  lines.push("--------------------------------");
  lines.push(`Subtotal: ${m(o.subtotal)}`);
  if (o.discount > 0) lines.push(`Discount: -${m(o.discount)}`);
  if (o.tax > 0) lines.push(`Tax: +${m(o.tax)}`);
  lines.push(`Total: ${m(o.total)}`);
  lines.push(`Paid: ${m(o.paid)}`);
  lines.push(`Balance: ${m(o.balance)}`);
  lines.push("");
  lines.push("Thank you for your patronage!");
  return lines.join("\n");
}
