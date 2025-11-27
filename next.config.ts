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
    if (!isServer) {
      try {
        const path = require("path");
        const noopWorkerPath = path.resolve(__dirname, "src/lib/noop-pdf-worker.js");
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
      };
      
        // Add alias for all possible worker import paths
      config.resolve.alias = {
        ...config.resolve.alias,
          "pdf.worker.js": noopWorkerPath,
          "./pdf.worker.js": noopWorkerPath,
          "../pdf.worker.js": noopWorkerPath,
          "pdfjs-dist/legacy/build/pdf.worker.js": noopWorkerPath,
          "pdfjs-dist/build/pdf.worker.js": noopWorkerPath,
          "pdfjs-dist/legacy/build/pdf.worker.mjs": noopWorkerPath,
          "pdfjs-dist/build/pdf.worker.mjs": noopWorkerPath,
        };
        
        // Replace all pdf.worker.js imports with our no-op worker
        // This handles both file paths and package imports
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            /pdf\.worker\.(js|mjs)$/,
            (resource: { request: string }) => {
              if (resource.request && resource.request.includes('pdf.worker')) {
                resource.request = noopWorkerPath;
              }
            }
          )
        );
        
        // Handle bare package imports like 'pdf.worker.js'
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            /^pdf\.worker\.js$/,
            (resource: { request: string }) => {
              resource.request = noopWorkerPath;
            }
          )
        );
        
        // Also handle require() calls for pdf.worker.js
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            /^pdfjs-dist[\/\\]legacy[\/\\]build[\/\\]pdf\.worker\.js$/,
            (resource: { request: string }) => {
              resource.request = noopWorkerPath;
            }
          )
        );
        
        console.log(`[next.config] Server PDF worker requests mapped to no-op worker: ${noopWorkerPath}`);
      } catch (error) {
        console.warn(`[next.config] Could not configure PDF worker:`, error);
      }
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
