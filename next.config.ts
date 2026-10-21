import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
