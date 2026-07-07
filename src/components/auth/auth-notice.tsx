"use client";

import { useSearchParams } from "next/navigation";

export function AuthNotice() {
  const reason = useSearchParams().get("reason");

  if (reason === "timeout") {
    return (
      <div className="mb-5 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-content-muted">
        You were logged out due to inactivity. Please log in again.
      </div>
    );
  }
  if (reason === "confirm_failed") {
    return (
      <div className="mb-5 rounded-lg bg-danger/10 px-3 py-2.5 text-sm text-danger">
        That confirmation link was invalid or has expired. Please sign up again or request a new link.
      </div>
    );
  }
  return null;
}
