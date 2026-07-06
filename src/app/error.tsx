"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surfaces in the Vercel runtime logs for alerting/triage.
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <Logo className="mb-8 text-xl" />
      <h1 className="font-display text-2xl font-extrabold">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-content-muted">
        An unexpected error occurred. Please try again — if it keeps happening, come back in a little while.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
