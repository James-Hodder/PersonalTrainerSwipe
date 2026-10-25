import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages ship raw TypeScript, so Next has to compile them.
  transpilePackages: ["@pt-swipe/shared"],
};

export default nextConfig;
