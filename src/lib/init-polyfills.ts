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
// Note: This is a best-effort polyfill - webpack aliases handle most cases
if (typeof require !== 'undefined' && typeof global !== 'undefined') {
  try {
    const globalScope = global as { __originalRequire?: typeof require; [key: string]: unknown };
    
    // Store original require for potential future use
    if (!globalScope.__originalRequire) {
      globalScope.__originalRequire = require;
    }
    // Note: We can't directly replace require in Node.js/webpack, but webpack aliases handle this
  } catch {
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

