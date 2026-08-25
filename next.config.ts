import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A lockfile in the parent directory makes Next infer the wrong workspace
  // root on the deploy server; pin it to this project.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "command.modfirst.com",
      },
    ],
  },
};

export default nextConfig;
