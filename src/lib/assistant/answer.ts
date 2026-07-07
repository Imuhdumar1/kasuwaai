import { formatMoney } from "@/lib/format";
import type { Lang } from "@/lib/i18n";

export type AssistantSnapshot = {
  currency: string;
  todaySales: number;
  weekSales: number;
  monthSales: number;
  totalRevenue: number;
  totalProfit: number;
  paymentsReceived: number;
  outstandingDebt: number;
  customerCount: number;
  productCount: number;
  transactionCount: number;
  overdueCount: number;
  debtors: { name: string; amount: number }[];
  overdue: { name: string; amount: number; dueLabel: string }[];
  topCustomer: { name: string; total: number } | null;
  bestProduct: { name: string; qty: number; revenue: number } | null;
  recommendations: string[];
  business: {
    name: string;
    owner: string | null;
    phone: string | null;
    email: string | null;
    category: string | null;
    market: string | null;
    state: string | null;
    lga: string | null;
  };
};

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

/**
 * Deterministic assistant. Answers strictly from the business snapshot (real
 * DB data) — it never invents figures. Supports English and Hausa phrasing.
 */
export function answerQuestion(question: string, s: AssistantSnapshot, lang: Lang): string {
  const q = " " + question.toLowerCase().trim() + " ";
  const m = (n: number) => formatMoney(n, s.currency);
  const ha = lang === "ha";
  const noData = s.transactionCount === 0;

  const notEnough = ha
    ? "Babu isassun bayanan kasuwanci tukuna. Yi rikodin sayarwa don farawa."
    : "There isn't enough business data yet. Record a sale to get started.";

  const b = s.business;

  // ── Business profile (answerable even before any sales) ──
  if (has(q, "business name", "name of my business", "shop name", "my business call", "sunan kasuwanci", "sunan shago")) {
    return ha ? `Sunan kasuwancinka: ${b.name}.` : `Your business name is ${b.name}.`;
  }
  if (has(q, "who owns", "owner", "my name", "who am i", "sunana", "wanene ni", "mai shago")) {
    return b.owner
      ? ha ? `Mai kasuwancin shine ${b.owner}.` : `The business owner is ${b.owner}.`
      : ha ? "Ba a saita sunan mai shago ba — ka iya ƙara shi a Saituna." : "No owner name is set yet — you can add it in Settings.";
  }
  if (has(q, "phone", "contact", "reach me", "lambar waya", "wayata")) {
    return b.phone
      ? ha ? `Lambar wayar kasuwanci: ${b.phone}.` : `Your business phone is ${b.phone}.`
      : ha ? "Ba a saita lambar waya ba — ƙara ta a Saituna." : "No business phone is set — add it in Settings.";
  }
  if (has(q, "where", "location", "market", "which state", "my state", "address", "ina kasuwa", "wuri", "jiha")) {
    const parts = [b.market, b.lga, b.state].filter(Boolean).join(", ");
    return parts
      ? ha ? `Kasuwancinka yana: ${parts}.` : `Your business is located at ${parts}.`
      : ha ? "Ba a saita wuri ba — ƙara shi a Saituna." : "No location is set — add it in Settings.";
  }
  if (has(q, "category", "kind of business", "type of business", "what do i sell", "rukunin kasuwanci", "nau'in kasuwanci")) {
    return b.category
      ? ha ? `Rukunin kasuwancinka: ${b.category}.` : `Your business category is ${b.category}.`
      : ha ? "Ba a saita rukuni ba — ƙara shi a Saituna." : "No category is set — add it in Settings.";
  }
  if (has(q, "currency", "kuɗi na", "wace kuɗi")) {
    return ha ? `Kuɗin da kake amfani: ${b.name} yana amfani da ${s.currency}.` : `Your business uses ${s.currency}.`;
  }

  // Who owes me money / debts list
  if (has(q, "owe", "owes", "owing", "debtor", "bashi", "bin ni", "wa ke bin")) {
    if (s.debtors.length === 0)
      return ha ? "Babu wanda ke bin ka bashi a yanzu. 👏" : "Nobody owes you money right now. 👏";
    const lines = s.debtors.slice(0, 8).map((d) => `• ${d.name} — ${m(d.amount)}`).join("\n");
    return (ha ? `Ga wadanda ke bin ka bashi (jimilla ${m(s.outstandingDebt)}):\n` : `Here's who owes you (total ${m(s.outstandingDebt)}):\n`) + lines;
  }

  // Overdue
  if (has(q, "overdue", "late", "wuce lokaci", "wucewa")) {
    if (s.overdue.length === 0) return ha ? "Babu bashin da ya wuce lokaci. 👍" : "No overdue debts. 👍";
    const lines = s.overdue.slice(0, 8).map((d) => `• ${d.name} — ${m(d.amount)} (${d.dueLabel})`).join("\n");
    return (ha ? `Ga bashin da suka wuce lokaci:\n` : `These debts are overdue:\n`) + lines;
  }

  // Sales today
  if (has(q, "today", "yau")) {
    return ha ? `Tallace-tallacen yau: ${m(s.todaySales)}.` : `You've sold ${m(s.todaySales)} today.`;
  }

  // This week / summary
  if (has(q, "week", "mako", "summar", "takaita", "overview")) {
    if (noData) return notEnough;
    return ha
      ? `Takaitawar mako: tallace-tallace ${m(s.weekSales)}, an karɓi ${m(s.paymentsReceived)}, sauran bashi ${m(s.outstandingDebt)} (${s.overdueCount} sun wuce lokaci).`
      : `This week: ${m(s.weekSales)} in sales. Overall you've collected ${m(s.paymentsReceived)} and are owed ${m(s.outstandingDebt)} across ${s.overdueCount} overdue debt(s).`;
  }

  // Month
  if (has(q, "month", "wata")) {
    return ha ? `Tallace-tallacen wata: ${m(s.monthSales)}.` : `You've sold ${m(s.monthSales)} this month.`;
  }

  // Total debt
  if (has(q, "how much debt", "total debt", "debt do i", "nawa ne bashi", "jimillar bashi", "much do")) {
    return ha
      ? `Ana bin ka jimillar ${m(s.outstandingDebt)} daga abokan ciniki ${s.debtors.length}.`
      : `You're owed ${m(s.outstandingDebt)} in total across ${s.debtors.length} customer(s).`;
  }

  // Payments received
  if (has(q, "payment", "received", "collect", "karɓa", "karba", "biya")) {
    return ha ? `An karɓi jimillar ${m(s.paymentsReceived)}.` : `You've received ${m(s.paymentsReceived)} in payments so far.`;
  }

  // Profit / margin
  if (has(q, "profit", "margin", "riba", "ribar", "how much am i making", "making")) {
    if (noData) return notEnough;
    const margin = s.totalRevenue > 0 ? Math.round((s.totalProfit / s.totalRevenue) * 100) : 0;
    return ha
      ? `Ribar ka jimilla ${m(s.totalProfit)} — kimanin kashi ${margin}% na tallace-tallacen ${m(s.totalRevenue)}.`
      : `Your total profit is ${m(s.totalProfit)} — about a ${margin}% margin on ${m(s.totalRevenue)} in sales.`;
  }

  // Counts (how many customers / products / sales)
  if (has(q, "how many", "number of", "count", "nawa ne", "yawan")) {
    if (has(q, "customer", "abokan", "abokin"))
      return ha ? `Kana da abokan ciniki ${s.customerCount}.` : `You have ${s.customerCount} customer(s).`;
    if (has(q, "product", "kaya"))
      return ha ? `Kana da kayayyaki ${s.productCount}.` : `You have ${s.productCount} product(s).`;
    return ha
      ? `Kana da ma'amaloli ${s.transactionCount}, abokan ciniki ${s.customerCount}, da kayayyaki ${s.productCount}.`
      : `You have ${s.transactionCount} transaction(s), ${s.customerCount} customer(s) and ${s.productCount} product(s).`;
  }

  // Best product
  if (has(q, "product", "sell the most", "best selling", "kaya", "fi saye", "fi sayuwa")) {
    if (!s.bestProduct) return notEnough;
    return ha
      ? `Kayan da ya fi sayuwa shine ${s.bestProduct.name} — an sayar da ${s.bestProduct.qty}, kuɗin shiga ${m(s.bestProduct.revenue)}.`
      : `Your best-selling product is ${s.bestProduct.name} — ${s.bestProduct.qty} sold for ${m(s.bestProduct.revenue)}.`;
  }

  // Best customer
  if (has(q, "best customer", "top customer", "who is my best", "abokin ciniki", "mafi kyau")) {
    if (!s.topCustomer) return notEnough;
    return ha
      ? `Babban abokin cinikinka shine ${s.topCustomer.name} da jimillar ${m(s.topCustomer.total)}.`
      : `Your best customer is ${s.topCustomer.name}, with ${m(s.topCustomer.total)} in total sales.`;
  }

  // Improve / advice
  if (has(q, "improve", "advice", "should i", "better", "inganta", "shawara")) {
    if (noData) return notEnough;
    return (ha ? "Shawarwari:\n" : "Here are some suggestions:\n") + s.recommendations.map((r) => `• ${r}`).join("\n");
  }

  // Revenue / total sales
  if (has(q, "revenue", "total sales", "how much have i sold", "kuɗin shiga", "jimillar tallace")) {
    return ha ? `Jimillar kuɗin shiga: ${m(s.totalRevenue)} daga ma'amaloli ${s.transactionCount}.` : `Total revenue is ${m(s.totalRevenue)} across ${s.transactionCount} transaction(s).`;
  }

  // Fallback / help
  return ha
    ? `Zan iya amsa tambayoyi game da kasuwancin ${b.name} — misali: Sunan kasuwancina? Wa ke bin ni bashi? Nawa na sayar yau? Ribata nawa? Wane kaya ya fi sayuwa? Ina kasuwata?`
    : `I can answer questions about ${b.name} — try: “What's my business name?”, “Who owes me money?”, “How much did I sell today?”, “What's my profit?”, “Which product sells the most?”, or “Where is my business?”`;
}

export const SUGGESTED_QUESTIONS: Record<Lang, string[]> = {
  en: [
    "Who owes me money?",
    "How much did I sell today?",
    "Show overdue customers",
    "Which product sells the most?",
    "Who is my best customer?",
    "Summarize my business this week",
    "What should I improve?",
  ],
  ha: [
    "Wa ke bin ni bashi?",
    "Nawa na sayar yau?",
    "Nuna bashin da ya wuce lokaci",
    "Wane kaya ya fi sayuwa?",
    "Wanene babban abokin cinikina?",
    "Takaita kasuwancina na wannan mako",
    "Me zan inganta?",
  ],
};
