import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

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
      const workerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.js");
      // Don't externalize pdf-parse - bundle it for production compatibility
      // This ensures it works in both dev and production
      
      // Polyfill browser APIs that pdf-parse might need
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
      };
      
      // Ensure pdf-parse can be resolved correctly
      config.resolve.alias = {
        ...config.resolve.alias,
        "pdf.worker.js": workerPath,
      };
    }
    
    return config;
  },
  // Ensure proper handling of native modules
  // Don't externalize pdf-parse - let Next.js bundle it for better compatibility
  // serverExternalPackages: ['pdf-parse'],
  // Increase body size limit for large file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;
