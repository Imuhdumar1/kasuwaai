import * as Sentry from "@sentry/nextjs";

// Only initializes when a DSN is provided, so the app is unaffected without it.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}
