import path from "node:path";
import type { NextConfig } from "next";

// Baseline browser hardening for every response. CSP keeps Next's inline
// bootstrap working ('unsafe-inline') but blocks plugins, base-tag hijacking,
// framing by other sites and form posts to other origins.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  {
    key: "Content-Security-Policy",
    value: [
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'self'",
      "form-action 'self' https://checkout.stripe.com https://www.paypal.com https://www.sandbox.paypal.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },



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
