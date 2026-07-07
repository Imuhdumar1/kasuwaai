import { withSentryConfig } from "@sentry/nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

// Built from the app's real origins: self, Google Fonts, Supabase (API + realtime),
// and Sentry ingest. Shipped as Report-Only first (see headers below).
// TODO: after verifying no legitimate violations are reported, switch the header
// key to "Content-Security-Policy" to enforce it.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  `connect-src 'self' ${supabaseUrl} https://*.supabase.co wss://*.supabase.co https://*.ingest.sentry.io https://*.sentry.io`,
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // CSP starts in Report-Only so it can't break the app; flip the key to
          // "Content-Security-Policy" once reports confirm nothing legitimate is blocked.
          { key: "Content-Security-Policy-Report-Only", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The app uses the microphone for voice sales; camera/geolocation are denied.
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self), payment=()" },
        ],
      },
    ];
  },
};

// Only bundle Sentry when a DSN is configured at build time, so the client
// bundle stays small when error monitoring is disabled. Set NEXT_PUBLIC_SENTRY_DSN
// in Vercel + redeploy to turn it on. Source-map upload is skipped unless
// SENTRY_AUTH_TOKEN/org/project are also set, so the build never fails.
const config = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: true,
      disableLogger: true,
    })
  : nextConfig;

export default config;
