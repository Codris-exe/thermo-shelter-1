import type { NextConfig } from "next";

const rawBackendUrl =
  process.env.BACKEND_URL ||
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : undefined);

const BACKEND_URL = rawBackendUrl ? rawBackendUrl.replace(/\/+$/, "") : undefined;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!BACKEND_URL) {
      return [];
    }
    return [
      {
        source: "/backend-api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;