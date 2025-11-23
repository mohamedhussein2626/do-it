import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // Handle PDF.js worker for client-side rendering
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
      };
    }
    
    // Ensure pdf-parse and its dependencies work properly
    if (isServer) {
      config.externals = config.externals || [];
      // Don't externalize pdf-parse, let it bundle
    }
    
    return config;
  },
  // Ensure proper handling of native modules
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
