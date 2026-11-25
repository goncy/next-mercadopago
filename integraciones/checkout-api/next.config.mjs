/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  partialPrefetching: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
