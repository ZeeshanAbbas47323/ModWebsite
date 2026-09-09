import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {


  async redirects() {
    return [
      { source: "/Net 30", destination: "/net-30", permanent: false },
      { source: "/Net%2030", destination: "/net-30", permanent: false },
      { source: "/net30", destination: "/net-30", permanent: false },






      { source: "/collections/:category/products/:slug", destination: "/products/:slug", permanent: true },
      { source: "/collections", destination: "/categories", permanent: true },
      { source: "/collections/:slug*", destination: "/categories/:slug*", permanent: true },



      { source: "/dtf-supplies", destination: "/categories/dtf-supplies", permanent: true },
    ];
  },


  turbopack: {
    root: path.resolve(__dirname),
  },



  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "command.modfirst.com",
      },
      {

        protocol: "https",
        hostname: "storage.modfirst.com",
      },
      {


        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {



        protocol: "https",
        hostname: "www.modfirst.com",
      },
      {

        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },
};

export default nextConfig;
