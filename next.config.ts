import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    remotePatterns: [{
      protocol: "https",
      hostname: "o6jh3tnkfvnkr22f.public.blob.vercel-storage.com",

    }]
  }
};

export default nextConfig;
