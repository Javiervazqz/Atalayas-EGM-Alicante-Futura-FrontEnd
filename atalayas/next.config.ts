import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',           // Cuando alguien entre a la raíz vacía
        destination: '/login', // Envíalo directamente aquí
        permanent: true,       // true = es una regla fija (código 308)
      },
    ];
  },
};

export default nextConfig;
