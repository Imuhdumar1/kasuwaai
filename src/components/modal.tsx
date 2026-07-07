"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const sizeClass = size === "sm" ? "sm:max-w-md" : size === "lg" ? "sm:max-w-3xl" : "sm:max-w-xl";

  const modal = (
    // Rendered into <body> via a portal so ancestor transforms (e.g. the page
    // fade-in animation) can't anchor this fixed layer to the page instead of
    // the viewport. Bottom-sheet on mobile, centered on larger screens.
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          // Dynamic viewport height (dvh) so the sheet respects the *visible* area
          // on mobile (with the address bar shown) — otherwise tall forms push the
          // Save button below the screen ("bleeding").
          "relative z-10 flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-soft",
          "sm:max-h-[calc(100dvh_-_2.5rem)] sm:rounded-2xl",
          sizeClass,
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line p-5">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold">{title}</h2>
            {description && <p className="mt-0.5 truncate text-sm text-content-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="-mr-1 shrink-0 rounded-lg p-1.5 text-content-muted hover:bg-surface-2"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{children}</div>
        {footer && <div className="flex shrink-0 justify-end gap-2 border-t border-line p-4 px-5">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
