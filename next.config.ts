import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    after: true,
  },
  serverExternalPackages: ["pdf-to-img", "@pinecone-database/pinecone"],
};

export default nextConfig;
