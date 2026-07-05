/**
 * Deterministic, rule-based transaction extractor for KasuwaAI voice sales.
 * No API keys, no external service — it parses English, Hausa, and mixed
 * Hausa-English sentences into an editable transaction.
 *
 * Handles the spec examples, e.g.:
 *  - "Three bags of rice sold to Haruna for one hundred and eighty thousand
 *     naira. He paid one hundred thousand."
 *  - "Haruna ya sayi bags uku na shinkafa akan naira dubu dari da tamanin.
 *     Ya biya naira dubu dari."
 */

export type ParsedItem = {
  productId: string | null;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  costPrice: number;
};

export type ParsedSale = {
  customerId: string | null;
  customerName: string | null;
  items: ParsedItem[];
  amountPaid: number;
  total: number;
  notes: string;
};

export type ParseContext = {
  products: { id: string; name: string; selling_price: number; cost_price: number; unit: string }[];
  customers: { id: string; full_name: string }[];
};

/* ─── Number words (English + Hausa) ──────────────────────────────────── */
const UNITS: Record<string, number> = {
  // English
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  // Hausa
  daya: 1, "ɗaya": 1, biyu: 2, uku: 3, hudu: 4, "huɗu": 4, biyar: 5, shida: 6, bakwai: 7,
  takwas: 8, tara: 9, goma: 10, ashirin: 20, talatin: 30, "arba'in": 40, arbain: 40,
  hamsin: 50, sittin: 60, "saba'in": 70, sabain: 70, tamanin: 80, "casa'in": 90, casain: 90,
  "tasa'in": 90,
};
const HUNDRED = new Set(["hundred", "dari", "ɗari"]);
const THOUSAND = new Set(["thousand", "dubu"]);
const MILLION = new Set(["million", "miliyan"]);

const NUMBER_WORD = (w: string) =>
  w in UNITS || HUNDRED.has(w) || THOUSAND.has(w) || MILLION.has(w);

/** Parse a hundreds/units phrase with no thousand scale (e.g. "dari da tamanin" = 180). */
function parseSub(words: string[]): number {
  let current = 0;
  for (const w of words) {
    if (w in UNITS) current += UNITS[w];
    else if (HUNDRED.has(w)) current = (current === 0 ? 1 : current) * 100;
  }
  return current;
}

/** Convert a run of number words to a value, handling English and Hausa order. */
function wordsToNumber(words: string[]): number {
  const toks = words.filter((w) => NUMBER_WORD(w) || w === "da" || w === "and");
  if (toks.length === 0) return 0;

  const thouIdx = toks.findIndex((w) => THOUSAND.has(w));
  if (thouIdx !== -1) {
    const before = toks.slice(0, thouIdx).filter((w) => w !== "da" && w !== "and");
    const after = toks.slice(thouIdx + 1).filter((w) => w !== "da" && w !== "and");
    // Hausa order ("dubu dari da tamanin"): nothing before the scale → multiply the rest.
    if (before.length === 0) return parseSub(after) * 1000;
    // English order ("one hundred and eighty thousand"): multiply what came before.
    return parseSub(before) * 1000 + parseSub(after);
  }
  return parseSub(toks.filter((w) => w !== "da" && w !== "and"));
}

/** Read a number (digits or words) from a text span. Prefers explicit digits. */
function numberFromSpan(span: string): number {
  const digits = span.replace(/[,\s]/g, "").match(/\d+(?:\.\d+)?/);
  if (digits) {
    let v = parseFloat(digits[0]);
    if (/\bk\b|thousand|dubu/.test(span) && v < 1000) v *= 1000;
    return v;
  }
  return wordsToNumber(span.toLowerCase().split(/[^a-zɗ'₦]+/i).filter(Boolean));
}

const UNIT_WORDS = ["bag", "bags", "carton", "cartons", "piece", "pieces", "dozen", "kg", "litre", "liters", "pack", "packs", "buhu", "buhunan", "roll", "rolls", "yard", "yards"];

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ─── Main extractor ──────────────────────────────────────────────────── */
export function parseTransaction(raw: string, ctx: ParseContext): ParsedSale {
  const text = raw.trim();
  const lower = " " + text.toLowerCase() + " ";

  // ── Customer ──
  let customerName: string | null = null;
  let customerId: string | null = null;

  // Known customer mentioned anywhere.
  for (const c of ctx.customers) {
    const first = c.full_name.split(/\s+/)[0].toLowerCase();
    if (first && lower.includes(" " + first)) {
      customerName = c.full_name;
      customerId = c.id;
      break;
    }
  }
  if (!customerName) {
    // Hausa "X ya/ta sayi" (X bought) or English "sold to X" / "to X".
    const ha = text.match(/\b([A-Za-zɗ']+)\s+(?:ya|ta)\s+say/i);
    const en = text.match(/\b(?:sold\s+to|to|for)\s+([A-Za-z]+)\b/i);
    const name = ha?.[1] ?? (en && !NUMBER_WORD(en[1].toLowerCase()) ? en[1] : null);
    if (name && !UNIT_WORDS.includes(name.toLowerCase())) customerName = titleCase(name);
  }

  // ── Amount paid: after "paid" / "biya" ──
  let amountPaid = 0;
  const paidMatch = lower.match(/(?:paid|biya)\s+([^.]*)/);
  if (paidMatch) amountPaid = numberFromSpan(paidMatch[1]);

  // ── Total / price: after "for" / "akan" / "at" ──
  let total = 0;
  const priceMatch = lower.match(/(?:for|akan|at|kan)\s+([^.]*)/);
  if (priceMatch) {
    // Trim the span before a "paid" clause if they share a sentence.
    const span = priceMatch[1].split(/paid|biya/)[0];
    total = numberFromSpan(span);
  }

  // ── Quantity + product ──
  let quantity = 1;
  let productName = "";
  let productId: string | null = null;

  // Hausa first: "bags uku na shinkafa"  (unit qty na product)
  let m = text.match(new RegExp(`\\b(?:${UNIT_WORDS.join("|")})\\s+([\\w'ɗ]+)\\s+na\\s+([\\w'ɗ]+)`, "i"));
  // English: "<qty> bags of rice"  (qty unit of product)
  if (!m) m = text.match(new RegExp(`\\b([\\w'ɗ]+)\\s+(?:${UNIT_WORDS.join("|")})\\s+(?:of\\s+)?([\\w'ɗ]+)`, "i"));
  if (m) {
    quantity = numberFromSpan(m[1]) || 1;
    productName = m[2];
  } else {
    // Fallback: a small number followed by a word.
    const q = text.match(/\b([\w'ɗ]+)\s+([\w'ɗ]+)/);
    if (q && NUMBER_WORD(q[1].toLowerCase())) {
      quantity = numberFromSpan(q[1]) || 1;
      productName = q[2];
    }
  }

  // Map product name to a known product (synonyms: shinkafa = rice).
  const synonyms: Record<string, string> = { shinkafa: "rice", sukari: "sugar", mai: "oil", gari: "garri" };
  const pnLower = productName.toLowerCase();
  const searchName = synonyms[pnLower] ?? pnLower;
  let unit = "unit";
  let unitPrice = 0;
  let costPrice = 0;
  const known = ctx.products.find(
    (p) => p.name.toLowerCase().includes(searchName) || (pnLower && p.name.toLowerCase().includes(pnLower)),
  );
  if (known) {
    productId = known.id;
    productName = known.name;
    unit = known.unit;
    costPrice = known.cost_price;
    unitPrice = known.selling_price;
  } else if (productName) {
    productName = titleCase(productName);
  }

  // If a total was stated, derive unit price from it (overrides catalogue price).
  if (total > 0 && quantity > 0) unitPrice = Math.round((total / quantity) * 100) / 100;
  else if (unitPrice > 0) total = unitPrice * quantity;

  const items: ParsedItem[] = productName
    ? [{ productId, name: productName, quantity, unit, unitPrice, costPrice }]
    : [];

  return {
    customerId,
    customerName,
    items,
    amountPaid,
    total,
    notes: "",
  };
}
