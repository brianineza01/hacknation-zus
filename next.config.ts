import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["pdf-to-img", "@pinecone-database/pinecone"],
} satisfies NextConfig;

export default nextConfig;
