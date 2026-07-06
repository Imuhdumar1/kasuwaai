import { formatMoney, formatDate } from "@/lib/format";
import type { Lang } from "@/lib/i18n";

export type ReminderTone = "friendly" | "firm";
export type DueBucket = "overdue" | "today" | "upcoming" | "none";

/** Normalise a phone number to international format for wa.me (default Nigeria, 234). */
export function toWaNumber(raw: string | null | undefined, cc = "234"): string {
  const d = (raw ?? "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) return d.slice(2);
  if (d.startsWith(cc)) return d;
  if (d.startsWith("0")) return cc + d.slice(1);
  return d;
}

/** Digits only — for the sms: URI (local format is fine for the messaging app). */
export function toSmsNumber(raw: string | null | undefined): string {
  return (raw ?? "").replace(/[^\d+]/g, "");
}

/** Build a payment-reminder message the owner can copy or send via WhatsApp/SMS. */
export function buildReminder(o: {
  customerName: string;
  businessName: string;
  amount: number;
  currency: string;
  dueDate: string | null;
  bucket: DueBucket;
  tone: ReminderTone;
  lang: Lang;
}): string {
  const amt = formatMoney(o.amount, o.currency);
  const due = o.dueDate ? formatDate(o.dueDate) : "";
  const biz = o.businessName;

  if (o.lang === "ha") {
    const name = o.customerName || "abokin ciniki";
    const opener = o.tone === "friendly" ? `Sannu ${name}, ina fatan kana lafiya.` : `Sannu ${name}.`;
    let body: string;
    if (o.bucket === "overdue")
      body = `Kana da saura na ${amt} a ${biz}${due ? ` da ya kamata a biya ranar ${due}` : ""}, wanda ya wuce lokaci.`;
    else if (o.bucket === "today") body = `Saura na ${amt} a ${biz} ya kamata a biya yau.`;
    else if (o.bucket === "upcoming") body = `Saura na ${amt} a ${biz} zai zama biya${due ? ` ranar ${due}` : ""}.`;
    else body = `Kana da saura na ${amt} a ${biz}.`;
    const closer = o.tone === "friendly" ? "Idan ka sami dama, don Allah ka biya. Na gode!" : "Don Allah ka biya da wuri. Na gode.";
    return `${opener} ${body} ${closer}`;
  }

  const name = o.customerName || "there";
  const opener = o.tone === "friendly" ? `Hello ${name}, hope you're well.` : `Hello ${name}.`;
  let body: string;
  if (o.bucket === "overdue")
    body = `This is a reminder that your balance of ${amt} with ${biz}${due ? ` (due ${due})` : ""} is overdue.`;
  else if (o.bucket === "today") body = `Your balance of ${amt} with ${biz} is due today.`;
  else if (o.bucket === "upcoming") body = `Your balance of ${amt} with ${biz} will be due${due ? ` on ${due}` : ""}.`;
  else body = `You have an outstanding balance of ${amt} with ${biz}.`;
  const closer =
    o.tone === "friendly" ? "Whenever convenient, please arrange payment. Thank you!" : "Kindly settle it as soon as possible. Thank you.";
  return `${opener} ${body} ${closer}`;
}
