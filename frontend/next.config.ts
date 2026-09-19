import type { NextConfig } from "next";

const rawBackendUrl =
  process.env.BACKEND_URL ||
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL;

const BACKEND_URL = rawBackendUrl ? rawBackendUrl.replace(/\/+$/, "") : undefined;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!BACKEND_URL) {
      // Use native Next.js Serverless Route Handlers in app/backend-api/
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