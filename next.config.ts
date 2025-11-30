// @ts-nocheck
/** @type {import('next').NextConfig} */

const nextConfig = {
  turbopack: {}, // 👈 REQUIRED so Next.js stops complaining

  productionBrowserSourceMaps: false,

  webpack(config, { dev }) {
    if (dev) {
      config.devtool = false;
    }
    return config;
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  reactStrictMode: true,
};

export default nextConfig;
