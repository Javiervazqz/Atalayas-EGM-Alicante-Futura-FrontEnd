import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/', // Cuando el usuario entra a la raíz (localhost:5173)
        destination: '/login', // Lo mandamos directo al login
        permanent: false,
      },
    ];
  },
};

export default nextConfig;