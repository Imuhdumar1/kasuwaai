import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
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
