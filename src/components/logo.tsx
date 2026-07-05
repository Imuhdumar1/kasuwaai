import { cn } from "@/lib/utils";

/**
 * KasuwaAI brand mark — a market stall (roof + counter + goods), a nod to
 * "kasuwa" (Hausa for market). Ink glyph on a lime tile; reads on any surface.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} role="img" aria-label="KasuwaAI">
      <rect width="32" height="32" rx="8" fill="#c8f23a" />
      <path d="M6 13 L16 6.5 L26 13 Z" fill="#0a0a0a" />
      <rect x="7.5" y="14.5" width="17" height="2.4" rx="1.2" fill="#0a0a0a" />
      <rect x="9" y="18.4" width="3" height="7" rx="1.2" fill="#0a0a0a" />
      <rect x="14.5" y="18.4" width="3" height="7" rx="1.2" fill="#0a0a0a" />
      <rect x="20" y="18.4" width="3" height="7" rx="1.2" fill="#0a0a0a" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight", className)}>
      <LogoMark />
      KasuwaAI
    </span>
  );
}
