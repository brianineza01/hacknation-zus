import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@pinecone-database/pinecone"],
} satisfies NextConfig;

export default nextConfig;
