const nextConfig = {
  compress: true,
  reactStrictMode: false,
  distDir: ".next",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    minimumCacheTTL: 60 * 60 * 24 * 7,
    domains: ["localhost"],
  },
  rewrites() {
    return [
      {
        source: "/",
        destination: "/dashboard",
      },
    ];
  },
  poweredByHeader: false,
  env: {
    // Ensure client-side always receives a public API endpoint key
    NEXT_PUBLIC_API_ENDPOINT:
      process.env.NEXT_PUBLIC_API_ENDPOINT ||
      process.env.API_SERVER_ENDPOINT ||
      "http://localhost:5001",
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "",
    NEXT_PUBLIC_USER_SITE_URL:
      process.env.NEXT_PUBLIC_USER_SITE_URL || "http://localhost:5002",
  },
};

module.exports = nextConfig;
