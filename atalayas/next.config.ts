import type { NextConfig } from "next";

const nextConfig: NextConfig = {
async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true, // Set to false if this is a temporary change
      },
    ];
  }
}
export default nextConfig;
