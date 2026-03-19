import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
const allowedDevOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  ...(process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []),
];

const nextConfig: NextConfig = {
  allowedDevOrigins:
    process.env.NODE_ENV === "development"
      ? Array.from(new Set(allowedDevOrigins))
      : undefined,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
