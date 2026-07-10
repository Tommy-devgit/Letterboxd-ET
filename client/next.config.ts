import type { NextConfig } from "next";
import path from "node:path";

const apiProxyTarget = process.env.API_PROXY_TARGET ?? "https://letterboxd-et-serverside.vercel.app/api";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), ".."),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.imgix.net" },
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "**.tmdb.org" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
