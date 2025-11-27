type PdfJsWorkerModule = {
  WorkerMessageHandler?: unknown;
  [key: string]: unknown;
};

import pdfjsWorkerModule from "pdfjs-dist/legacy/build/pdf.worker.js";

let globalWorkerRegistered = false;

interface GlobalPdfWorkerScope {
  pdfjsWorker?: PdfJsWorkerModule;
}

function isServerEnvironment() {
  return typeof window === "undefined" && typeof process !== "undefined";
}

function registerGlobalWorker() {
  if (!isServerEnvironment() || globalWorkerRegistered) {
    return;
  }

  try {
    (globalThis as GlobalPdfWorkerScope).pdfjsWorker = pdfjsWorkerModule;
    globalWorkerRegistered = true;
    console.log("[pdf-worker] Registered bundled pdf.js worker module");
  } catch (error) {
    console.warn("[pdf-worker] Failed to register bundled worker module:", error);
  }
}

export function configurePdfjsWorker(pdfjsInstance: unknown, context = "pdfjs") {
  if (!isServerEnvironment() || !pdfjsInstance) {
    return;
  }

  registerGlobalWorker();

  const instance = pdfjsInstance as {
    GlobalWorkerOptions?: { workerSrc?: string | null };
    disableWorker?: boolean;
    [key: string]: unknown;
  };

  // CRITICAL: Disable worker completely by setting workerSrc to empty string
  // This forces pdfjs-dist to use main thread mode (no worker)
  // The legacy build supports this mode - empty string = main thread mode
  if (instance.GlobalWorkerOptions) {
    instance.GlobalWorkerOptions.workerSrc = "";
    console.log(`[pdf-worker] Disabled ${context} worker (main thread mode)`);
  }
  // Also set disableWorker flag if available
  if ('disableWorker' in instance && typeof instance.disableWorker === 'boolean') {
    instance.disableWorker = true;
  }
}

export async function configurePdfParseWorker(pdfParseModule: unknown) {
  if (!isServerEnvironment() || !pdfParseModule) {
    return;
  }

  registerGlobalWorker();

  // Configure pdfjs-dist (used by pdf-parse) to use the webpack alias
  // pdf-parse loads pdfjs-dist internally, so we configure it first
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.js");
    configurePdfjsWorker(pdfjs, "pdf-parse(pdfjs)");
  } catch (error) {
    console.warn(`[pdf-worker] Could not configure pdfjs-dist for pdf-parse:`, error);
  }

  const pdfParseClass = (pdfParseModule as { PDFParse?: { setWorker?: (src: string) => string | void } }).PDFParse;

  if (pdfParseClass && typeof pdfParseClass.setWorker === "function") {
    pdfParseClass.setWorker(""); // Empty string = main thread mode
    console.log(`[pdf-worker] pdf-parse worker disabled (server-side)`);
  }
}
