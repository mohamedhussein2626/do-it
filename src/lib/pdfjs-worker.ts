/**
 * PDF.js Worker Initialization Utility
 * Ensures worker is properly configured before PDF rendering
 */

import { pdfjs } from "react-pdf";

let workerInitialized = false;

/**
 * Initialize PDF.js worker
 * Must be called before rendering any PDF documents
 */
export function initializePdfWorker(): Promise<void> {
  if (workerInitialized && pdfjs.GlobalWorkerOptions.workerSrc) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      // Use CDN worker - ensure version matches
      const workerVersion = pdfjs.version || "3.4.120";
      const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${workerVersion}/pdf.worker.min.js`;
      
      // Set worker source
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      
      console.log("PDF.js worker configured:", pdfjs.GlobalWorkerOptions.workerSrc);
      
      // Verify worker is set
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        reject(new Error("Failed to set PDF.js worker source"));
        return;
      }
      
      // Small delay to ensure worker is ready
      setTimeout(() => {
        workerInitialized = true;
        resolve();
      }, 300);
    } catch (error) {
      console.error("Error initializing PDF.js worker:", error);
      reject(error);
    }
  });
}

/**
 * Check if worker is initialized
 */
export function isWorkerReady(): boolean {
  return workerInitialized && !!pdfjs.GlobalWorkerOptions.workerSrc;
}

