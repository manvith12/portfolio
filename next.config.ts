import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicit turbopack root to avoid Next.js inferring parent workspaces
  // (prevents warnings when multiple lockfiles exist on the machine)
  turbopack: {
    root: "./",
  },
  /* Image optimization for Vercel */
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },

  /* Compress static output */
  compress: true,

  /* Tree-shake barrel exports for smaller bundles */
  experimental: {
    optimizePackageImports: ["animejs", "gsap"],
  },

  /* Caching + security headers */
  headers: async () => [
    {
      // All routes: security baseline
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
    {
      // Folder frame images — long-lived immutable cache + stale-while-revalidate fallback
      source: "/assets/folder/:path*",
      headers: [
        {
          key: "Cache-Control",
          value:
            "public, max-age=31536000, stale-while-revalidate=86400, immutable",
        },
        // Restrict cross-origin access to same-origin only
        { key: "Access-Control-Allow-Origin", value: "https://manvith.me" },
        { key: "X-Robots-Tag", value: "noindex" },
      ],
    },
    {
      // Other static assets
      source: "/assets/:path*",
      headers: [
        {
          key: "Cache-Control",
          value:
            "public, max-age=31536000, stale-while-revalidate=86400, immutable",
        },
      ],
    },
    {
      // Fonts — immutable, max-age 1 year
      source: "/fonts/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
