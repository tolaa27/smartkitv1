import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Initialize OpenNext Cloudflare for local development environment
import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
