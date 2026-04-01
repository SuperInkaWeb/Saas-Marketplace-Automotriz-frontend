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
      source: "/api/auth/:path*",
      destination: `${backendUrl}/auth/:path*`,
    },
    {
      source: "/api/:path*",
      destination: `${backendUrl}/api/:path*`,
    },
  ];
},
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Credentials", value: "true" },
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Authorization,Content-Type" },
      ],
    },
  ];
},
};

export default nextConfig;
