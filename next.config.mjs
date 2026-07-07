import { withSentryConfig } from "@sentry/nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

// Built from the app's real origins: self, Google Fonts, Supabase (API + realtime),
// and Sentry ingest. Now ENFORCED (the app talks to no other origins — no
// analytics/third-party scripts — so enforcing can't break legitimate traffic).
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
          // Enforced Content Security Policy.
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The app uses the microphone for voice sales; camera/geolocation are denied.
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self), payment=()" },
          // Cross-origin isolation: keep our top-level window in its own group
          // (allow-popups so target=_blank WhatsApp/SMS links still work).
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          // Don't leak URLs to DNS prefetch, and deny legacy Flash/PDF cross-domain access.
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
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
