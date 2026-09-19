import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_API_URL?.replace(/\/$/, "");

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