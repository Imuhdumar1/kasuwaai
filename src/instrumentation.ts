import * as Sentry from "@sentry/nextjs";

// Runs on the server + edge runtimes. Only initializes when a DSN is present.
export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}

// Captures errors thrown in Server Components / route handlers.
export const onRequestError = Sentry.captureRequestError;
