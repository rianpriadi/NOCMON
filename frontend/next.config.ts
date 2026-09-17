import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production
  reactStrictMode: true,
  // Compress responses
  compress: true,
  // Disable x-powered-by header for security
  poweredByHeader: false,
};

export default nextConfig;
