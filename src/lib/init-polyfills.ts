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

// Suppress pdfjs-dist worker errors globally
// These errors occur because pdfjs-dist tries to use web workers even in Node.js
if (typeof process !== 'undefined') {
  const workerErrorPatterns = [
    'unknown action from worker',
    'workermessagehandler',
    'worker: configure',
    'worker: getdocrequest',
    'pdf.worker',
    'cannot find module \'pdf.worker',
  ];
  
  const isWorkerError = (reason: unknown): boolean => {
    if (reason instanceof Error) {
      const message = reason.message.toLowerCase();
      return workerErrorPatterns.some(pattern => message.includes(pattern));
    }
    if (typeof reason === 'string') {
      const message = reason.toLowerCase();
      return workerErrorPatterns.some(pattern => message.includes(pattern));
    }
    return false;
  };
  
  // Remove all existing unhandledRejection listeners temporarily
  const existingListeners = process.rawListeners('unhandledRejection');
  process.removeAllListeners('unhandledRejection');
  
  // Add our suppression handler FIRST (will be called first)
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    if (isWorkerError(reason)) {
      // Completely suppress - don't log, don't throw
      promise.catch(() => {}); // Prevent the error from propagating
      return;
    }
    
    // For non-worker errors, call the original handlers
    existingListeners.forEach(listener => {
      try {
        (listener as (reason: unknown, promise: Promise<unknown>) => void)(reason, promise);
      } catch {
        // Ignore errors in handlers
      }
    });
  });
}

