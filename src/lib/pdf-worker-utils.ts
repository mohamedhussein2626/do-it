type PdfJsWorkerModule = {
  WorkerMessageHandler?: unknown;
  [key: string]: unknown;
};

import pdfjsWorkerModule from "pdfjs-dist/legacy/build/pdf.worker.js";

let globalWorkerRegistered = false;
const WORKER_SRC_PLACEHOLDER = "pdf.worker.js";

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
  };

  // Completely disable workers on server - use main thread only
  if (instance.GlobalWorkerOptions) {
    // Set to empty string to disable worker completely
    instance.GlobalWorkerOptions.workerSrc = "";
    console.log(`[pdf-worker] Disabled ${context} worker (server-side main thread only)`);
  }
}

export async function configurePdfParseWorker(pdfParseModule: unknown) {
  if (!isServerEnvironment() || !pdfParseModule) {
    return;
  }

  registerGlobalWorker();

  // First, ensure pdfjs-dist (used by pdf-parse) has workers disabled globally
  // pdf-parse loads pdfjs-dist internally, so we configure it first
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
    if (pdfjs && pdfjs.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = "";
      console.log(`[pdf-worker] Disabled pdfjs-dist worker for pdf-parse`);
    }
  } catch (error) {
    console.warn(`[pdf-worker] Could not configure pdfjs-dist for pdf-parse:`, error);
  }

  const pdfParseClass = (pdfParseModule as { PDFParse?: { setWorker?: (src: string) => string | void } }).PDFParse;

  if (pdfParseClass && typeof pdfParseClass.setWorker === "function") {
    // Set to empty string to disable worker completely (server-side main thread only)
    const configuredSrc = pdfParseClass.setWorker("");
    if (configuredSrc !== undefined) {
      console.log(`[pdf-worker] pdf-parse worker disabled (server-side)`);
    }
  }
}
