import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: false,
  distDir: ".next",
  i18n: {
    locales: ["en", "vi"],
    defaultLocale: "vi",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    domains: ['localhost']
  },
  poweredByHeader: false,
  serverRuntimeConfig: {
    API_ENDPOINT: process.env.API_SERVER_ENDPOINT || process.env.API_ENDPOINT
  },
  publicRuntimeConfig: {
    SITE_URL: process.env.SITE_URL,
    API_ENDPOINT: process.env.API_ENDPOINT || 'http://localhost:5001',
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID
  },
  env: {
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID
  }
};

export default nextConfig;

