import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The CMS menu stores hand-typed slugs, so its "Net 30" item points at a
  // path containing a space. Send those to the real page.
  async redirects() {
    return [
      { source: "/Net 30", destination: "/net-30", permanent: false },
      { source: "/Net%2030", destination: "/net-30", permanent: false },
      { source: "/net30", destination: "/net-30", permanent: false },
    ];
  },
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
