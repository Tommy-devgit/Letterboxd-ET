import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), ".."),
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
