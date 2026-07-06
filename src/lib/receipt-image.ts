import { formatMoney, formatDate } from "@/lib/format";

export type ReceiptData = {
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
};

/** Draw the receipt to a canvas and return it as a PNG blob (for sharing/downloading). */
export async function renderReceiptImage(o: ReceiptData): Promise<Blob | null> {
  const pad = 34;
  const W = 660;
  const lineH = 30;
  const totalRows = 3 + (o.discount > 0 ? 1 : 0) + (o.tax > 0 ? 1 : 0); // subtotal, total, balance, +disc/tax
  const H =
    64 + 24 + (o.customerName ? 22 : 0) + 26 + o.items.length * lineH + 28 + totalRows * 30 + 90 + pad;

  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(scale, scale);

  try {
    await (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready;
  } catch {
    /* fonts may be unavailable — Arial fallback is fine */
  }

  const money = (n: number) => formatMoney(n, o.currency);
  const setFont = (size: number, weight = "400") => {
    ctx.font = `${weight} ${size}px 'DM Sans', Arial, sans-serif`;
  };
  const left = (s: string, y: number, size: number, weight = "400", color = "#0a0a0a") => {
    setFont(size, weight);
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.fillText(s, pad, y);
  };
  const right = (s: string, y: number, size: number, weight = "400", color = "#0a0a0a") => {
    setFont(size, weight);
    ctx.fillStyle = color;
    ctx.textAlign = "right";
    ctx.fillText(s, W - pad, y);
  };
  const divider = (y: number) => {
    ctx.strokeStyle = "#e5e1d8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, y + 0.5);
    ctx.lineTo(W - pad, y + 0.5);
    ctx.stroke();
  };

  // Background + lime brand strip
  ctx.fillStyle = "#fffdf7";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#c8f23a";
  ctx.fillRect(0, 0, W, 10);

  let y = 54;
  left(o.businessName, y, 26, "700");
  y += 24;
  left(`RECEIPT · ${formatDate(o.date)}`, y, 13, "500", "#6b6560");
  if (o.customerName) {
    y += 22;
    left(`Customer: ${o.customerName}`, y, 14, "500");
  }
  y += 22;
  divider(y);
  y += 30;

  for (const it of o.items) {
    left(`${it.quantity} × ${it.name}`, y, 15);
    right(money(it.lineTotal), y, 15, "600");
    y += lineH;
  }
  y += 6;
  divider(y);
  y += 30;

  const row = (label: string, val: string, weight = "400", size = 14, color = "#0a0a0a", labelColor = "#6b6560") => {
    left(label, y, size, weight, labelColor);
    right(val, y, size, weight, color);
    y += 30;
  };
  row("Subtotal", money(o.subtotal));
  if (o.discount > 0) row("Discount", "-" + money(o.discount));
  if (o.tax > 0) row("Tax", "+" + money(o.tax));
  row("Total", money(o.total), "700", 17, "#0a0a0a", "#0a0a0a");
  row("Paid", money(o.paid));
  row("Balance", money(o.balance), "700", 15, o.balance > 0 ? "#dc2626" : "#16a34a", o.balance > 0 ? "#dc2626" : "#16a34a");

  y += 8;
  left("Thank you for your patronage!", y, 14, "500", "#6b6560");
  y += 26;
  left("Powered by KasuwaAI", y, 12, "400", "#a8a29a");

  return await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}
