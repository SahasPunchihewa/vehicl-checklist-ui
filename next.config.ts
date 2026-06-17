import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "riyasewana.com",
      },
      {
        protocol: "https",
        hostname: "www.riyasewana.com",
      },
      {
        protocol: "http",
        hostname: "riyasewana.com",
      },
      {
        protocol: "http",
        hostname: "www.riyasewana.com",
      },
    ],
  },
};

export default nextConfig;
