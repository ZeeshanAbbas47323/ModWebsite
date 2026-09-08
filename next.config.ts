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
      // The old live site used /collections/... URLs (Shopify-style) even
      // though there is no Collection entity — the data was always product
      // categories. Routes moved to /categories; these keep old links,
      // bookmarks, and search-engine results working instead of 404ing.
      // Old Shopify-style nested product URL (/collections/<cat>/products/<slug>) —
      // the category segment was never meaningful to the lookup, only the slug.
      { source: "/collections/:category/products/:slug", destination: "/products/:slug", permanent: true },
      { source: "/collections", destination: "/categories", permanent: true },
      { source: "/collections/:slug*", destination: "/categories/:slug*", permanent: true },
      // /dtf-supplies used to be a standalone page with 4 hardcoded fake
      // products (fake prices, no links, no real data at all). It's now a
      // real ProductCategory — redirect the old URL to it.
      { source: "/dtf-supplies", destination: "/categories/dtf-supplies", permanent: true },
    ];
  },
  // A lockfile in the parent directory makes Next infer the wrong workspace
  // root on the deploy server; pin it to this project.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Dev-only: lets the dev server's HMR socket be reached when it's opened via
  // an IP/proxy instead of localhost (e.g. testing on another device on the
  // LAN). Next blocks that by default; production builds ignore this entirely.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "command.modfirst.com",
      },
      {
        // Primary media CDN (NEXT_PUBLIC_IMAGE_URL).
        protocol: "https",
        hostname: "storage.modfirst.com",
      },
      {
        // Most product and variant images are still stored as absolute
        // Shopify URLs in the database and are served straight from there.
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        // Blog post images, migrated from the business's own previous
        // Shopify site — hotlinked the same way product images already are
        // from cdn.shopify.com, rather than re-uploading 70+ images.
        protocol: "https",
        hostname: "www.modfirst.com",
      },
      {
        // Older CMS media bucket, still holding some files.
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
