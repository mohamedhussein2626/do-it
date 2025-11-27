/**
 * Next.js instrumentation file - runs before any other code
 * Perfect place to suppress worker errors globally
 */

// Suppress pdfjs-dist worker errors IMMEDIATELY
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
  
  // Add handler BEFORE anything else loads
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    if (isWorkerError(reason)) {
      // Completely suppress worker errors
      promise.catch(() => {}); // Prevent propagation
      return; // Don't log, don't throw
    }
    // For other errors, let Next.js handle them
  });
}

export async function register() {
  // This function is called when the server starts
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization
    console.log('✅ Server instrumentation loaded - worker errors suppressed');
  }
}

