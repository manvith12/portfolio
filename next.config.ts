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

  /* Enable SWR caching headers for static assets */
  headers: async () => [
    {
      source: "/assets/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
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
