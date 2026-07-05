export type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

/** Minimal className joiner (clsx-style) — avoids an extra dependency. */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (v: ClassValue) => {
    if (!v) return;
    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
    } else if (Array.isArray(v)) {
      v.forEach(walk);
    } else if (typeof v === "object") {
      for (const [k, cond] of Object.entries(v)) if (cond) out.push(k);
    }
  };
  inputs.forEach(walk);
  return out.join(" ");
}
