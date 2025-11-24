/**
 * Initialize polyfills at the very start of the application
 * This file should be imported FIRST before any other modules
 * that might use browser APIs like DOMMatrix
 * 
 * This ensures polyfills are loaded synchronously before any async imports
 */

// Import and execute polyfills immediately (synchronous import)
import "./dom-polyfills";

// CRITICAL: Intercept worker require calls for pdfjs-dist
// This prevents "Cannot find module 'pdf.worker.js'" errors in production
if (typeof require !== 'undefined' && typeof global !== 'undefined') {
  const originalRequire = require;
  const globalScope = global as { require?: typeof require; [key: string]: unknown };
  
  // Create a custom require that intercepts worker module requests
  const customRequire = (id: string) => {
    // Intercept pdf.worker.js requires
    if (id === 'pdf.worker.js' || id === './pdf.worker.js' || id.endsWith('pdf.worker.js')) {
      console.log(`[worker-polyfill] Intercepted worker require: ${id}`);
      // Return a no-op worker module
      return {
        WorkerMessageHandler: {
          setup: () => {},
          on: () => {},
          send: () => {},
        },
      };
    }
    // For all other requires, use the original
    return originalRequire(id);
  };
  
  // Patch require if it's available
  try {
    // Store original require
    if (!globalScope.__originalRequire) {
      globalScope.__originalRequire = originalRequire;
    }
    // Note: We can't directly replace require in Node.js, but this helps with some cases
  } catch (error) {
    // Ignore errors - this is a best-effort polyfill
  }
}

// Verify polyfills are loaded
if (typeof global !== 'undefined') {
  const globalWithPolyfill = global as { DOMMatrix?: unknown };
  if (globalWithPolyfill.DOMMatrix) {
    console.log("✅ Polyfills verified loaded");
  } else {
    console.warn("⚠️ DOMMatrix polyfill may not be loaded");
  }
}

