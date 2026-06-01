import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // instrumentation.ts (cron scheduler) dijalankan otomatis pada Next.js 15+
  serverExternalPackages: [
    'pkce-challenge',
    'express-rate-limit',
    '@modelcontextprotocol/sdk',
  ],
  turbopack: {
    resolveAlias: {
      'node:crypto': {
        browser: 'empty-module',
      },
    },
  },
};

export default nextConfig;
