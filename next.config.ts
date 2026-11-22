import type { NextConfig } from 'next';
import fs from 'node:fs';
import path from 'node:path';

// Pre-create output directory trees to prevent Windows parallel webpack mkdir race conditions (EPERM)
const apiRoutes = ['chat', 'health', 'plan', 'simulate', 'telemetry'];
for (const route of apiRoutes) {
  try {
    fs.mkdirSync(path.join(process.cwd(), '.next/server/app/api', route), { recursive: true });
    fs.mkdirSync(path.join(process.cwd(), '.next/static/chunks/app/api', route), { recursive: true });
  } catch {
    // Ignore if directory already exists
  }
}

const isProduction = process.env.NODE_ENV === 'production';

// Strict Content Security Policy
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  connect-src 'self' https://air-quality-api.open-meteo.com https://geocoding-api.open-meteo.com https://generativelanguage.googleapis.com;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), browsing-topics=()',
          },
          ...(isProduction
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
