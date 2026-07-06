"use client";

import { useEffect } from "react";

// Catches errors in the root layout itself, so it must render its own <html>/<body>
// (Tailwind/theme aren't guaranteed here — use inline styles).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      import("@sentry/nextjs").then((S) => S.captureException(error)).catch(() => {});
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "1.5rem",
          background: "#f5f2eb",
          color: "#0a0a0a",
          margin: 0,
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Something went wrong</h1>
        <p style={{ color: "#6b6560", marginTop: "0.5rem", maxWidth: "24rem" }}>
          A problem occurred while loading KasuwaAI. Please refresh the page.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: "1.25rem",
            background: "#0a0a0a",
            color: "#f5f2eb",
            padding: "0.6rem 1.25rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
