import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Make sure to use one of the allowed values
  swcMinify: true, // valid: true | false | 'swc' | 'terser'
  experimental: {
    serverActions: true as unknown as boolean, // TS-safe type cast
  },
};

export default nextConfig;
