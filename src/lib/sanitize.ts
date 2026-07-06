/**
 * Server-side input cleaning for form actions. Postgres queries are already
 * parameterized (no SQL injection) and React escapes all output (no XSS); this
 * adds defence-in-depth: trims, strips control characters, and caps length so
 * oversized or malformed input can't be stored.
 */
export function cleanText(v: FormDataEntryValue | null | undefined, max = 500): string | null {
  if (v == null) return null;
  // Keep printable chars + tab (9), newline (10), carriage return (13); drop other control codes.
  const t = Array.from(String(v))
    .filter((c) => {
      const code = c.charCodeAt(0);
      return code >= 32 || code === 9 || code === 10 || code === 13;
    })
    .join("")
    .trim();
  return t === "" ? null : t.slice(0, max);
}

export function cleanNumber(
  v: FormDataEntryValue | null | undefined,
  { min = 0, max = 1e12 }: { min?: number; max?: number } = {},
): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n, min), max);
}
