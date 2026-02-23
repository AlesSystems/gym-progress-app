import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
