/**
 * Initialize polyfills at the very start of the application
 * This file should be imported FIRST before any other modules
 * that might use browser APIs like DOMMatrix
 * 
 * This ensures polyfills are loaded synchronously before any async imports
 */

// Import and execute polyfills immediately (synchronous import)
import "./dom-polyfills";

// Verify polyfills are loaded
if (typeof global !== 'undefined') {
  const globalWithPolyfill = global as { DOMMatrix?: unknown };
  if (globalWithPolyfill.DOMMatrix) {
    console.log("✅ Polyfills verified loaded");
  } else {
    console.warn("⚠️ DOMMatrix polyfill may not be loaded");
  }
}

