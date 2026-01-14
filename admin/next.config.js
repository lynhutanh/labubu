const { i18n } = require('./next-i18next.config');

const nextConfig = {
  compress: true,
  reactStrictMode: false,
  distDir: '.next',
  i18n,
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true,
    minimumCacheTTL: 60 * 60 * 24 * 7,
    domains: ['localhost']
  },
  rewrites() {
    return [
      {
        source: '/',
        destination: '/dashboard'
      }
    ];
  },
  poweredByHeader: false,
  serverRuntimeConfig: {
    API_ENDPOINT: process.env.API_ENDPOINT || process.env.API_SERVER_ENDPOINT
  },
  publicRuntimeConfig: {
    API_ENDPOINT: process.env.API_ENDPOINT || 'http://localhost:5001',
    SITE_URL: process.env.SITE_URL
  },
  env: {
    API_ENDPOINT: process.env.API_ENDPOINT,
    SITE_URL: process.env.SITE_URL
  }
};

module.exports = nextConfig;

