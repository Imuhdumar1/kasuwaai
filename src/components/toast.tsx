"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  tone: Tone;
  actionLabel?: string;
  onAction?: () => void;
  duration: number;
};

type ToastOpts = {
  message: string;
  tone?: Tone;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
};

type ConfirmOpts = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ToastValue = {
  toast: (opts: ToastOpts) => void;
  confirm: (opts: ConfirmOpts) => Promise<boolean>;
};

const ToastContext = React.createContext<ToastValue | null>(null);

export function useToast(): ToastValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <Providers>");
  return ctx;
}

const ICON: Record<Tone, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  error: <AlertTriangle className="h-5 w-5 text-danger" />,
  info: <Info className="h-5 w-5 text-content-muted" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] =
    React.useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const idRef = React.useRef(0);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const remove = React.useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (opts: ToastOpts) => {
      const id = ++idRef.current;
      const duration = opts.duration ?? (opts.actionLabel ? 6000 : 3500);
      setToasts((ts) => [
        ...ts,
        { id, message: opts.message, tone: opts.tone ?? "info", actionLabel: opts.actionLabel, onAction: opts.onAction, duration },
      ]);
      if (duration > 0) setTimeout(() => remove(id), duration);
    },
    [remove],
  );

  const confirm = React.useCallback((opts: ConfirmOpts) => {
    return new Promise<boolean>((resolve) => setConfirmState({ ...opts, resolve }));
  }, []);

  const closeConfirm = (v: boolean) => {
    setConfirmState((cur) => {
      cur?.resolve(v);
      return null;
    });
  };

  const value = React.useMemo<ToastValue>(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <>
            {/* Toast stack */}
            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
              {toasts.map((t) => (
                <div
                  key={t.id}
                  role="status"
                  className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-card"
                >
                  <span className="shrink-0">{ICON[t.tone]}</span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-content">{t.message}</span>
                  {t.actionLabel && (
                    <button
                      onClick={() => {
                        t.onAction?.();
                        remove(t.id);
                      }}
                      className="shrink-0 text-sm font-semibold text-ink underline underline-offset-2 hover:opacity-70 dark:text-lime"
                    >
                      {t.actionLabel}
                    </button>
                  )}
                  <button
                    onClick={() => remove(t.id)}
                    aria-label="Dismiss"
                    className="shrink-0 text-content-muted hover:text-content"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Confirm dialog */}
            {confirmState && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-ink/40" onClick={() => closeConfirm(false)} />
                <div className="relative w-full max-w-sm animate-fade-up rounded-2xl border border-line bg-surface p-5 shadow-card">
                  {confirmState.title && (
                    <h3 className="font-display text-lg font-bold text-content">{confirmState.title}</h3>
                  )}
                  <p className={cn("text-sm text-content-muted", confirmState.title && "mt-1.5")}>
                    {confirmState.message}
                  </p>
                  <div className="mt-5 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => closeConfirm(false)}>
                      {confirmState.cancelLabel ?? "Cancel"}
                    </Button>
                    <Button
                      variant={confirmState.danger ? "danger" : "primary"}
                      onClick={() => closeConfirm(true)}
                    >
                      {confirmState.confirmLabel ?? "Confirm"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
