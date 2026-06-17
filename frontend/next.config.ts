import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Core configuration options for Tailwind v4 and Vercel deployment */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // 🚀 Safely allows image streaming from any secure remote domain (like Cloudinary)
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;