/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Permitimos abrir la app en desarrollo desde los túneles de Cloudflare y VSCode
  allowedDevOrigins: ["*.trycloudflare.com", "*.devtunnels.ms"],
  cacheComponents: true,
  partialPrefetching: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
