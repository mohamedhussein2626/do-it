// A no-op worker module for server-side environments where actual web workers are not available.
// This module provides a minimal interface that pdfjs-dist expects from its worker.
// pdfjs-dist may try to load this module even when workerSrc is set to empty string.
// This stub provides a minimal worker interface that allows pdfjs-dist to work in main-thread mode.

class WorkerMessageHandler {
  static setup(port) {
    // In a server environment, we don't actually set up a worker.
    // This method is called by pdfjs-dist when it tries to initialize a fake worker.
    // We provide a minimal message handler that allows pdfjs-dist to work in main-thread mode.
    // The port parameter is the message port that pdfjs-dist uses to communicate with the worker.
    
    if (port && typeof port.onmessage === 'function') {
      // Handle messages from pdfjs-dist
      port.onmessage = function(event) {
        const { data } = event;
        
        // Handle configure message
        if (data && data.action === 'configure') {
          // Just acknowledge the configuration - we're in main-thread mode
          if (port.postMessage) {
            port.postMessage({ success: true, action: 'configure' });
          }
          return;
        }
        
        // Handle GetDocRequest and other messages by acknowledging them
        // In main-thread mode, pdfjs-dist should handle these directly
        if (data && data.action) {
          if (port.postMessage) {
            port.postMessage({ 
              success: false, 
              action: data.action,
              error: 'Worker disabled - using main thread mode' 
            });
          }
        }
      };
    }
    
    return;
  }
}

// Export WorkerMessageHandler as expected by pdfjs-dist's fake worker setup
// Support both CommonJS and ES module imports
module.exports = {
  WorkerMessageHandler,
  default: {
    WorkerMessageHandler,
  },
};

// Also support ES module default export
if (typeof exports !== 'undefined') {
  exports.WorkerMessageHandler = WorkerMessageHandler;
  exports.default = { WorkerMessageHandler };
}

