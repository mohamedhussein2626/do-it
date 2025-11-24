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
  };

  // Configure worker - use webpack alias that should resolve at build time
  // The webpack alias in next.config.ts maps "pdf.worker.js" to the actual worker file
  // This works because webpack processes the require() calls in the bundled chunks
  if (instance.GlobalWorkerOptions) {
    // Use the alias - webpack will resolve this to the actual worker path
    // Both "pdf.worker.js" and "./pdf.worker.js" should be handled by the alias
    instance.GlobalWorkerOptions.workerSrc = "pdf.worker.js";
    console.log(`[pdf-worker] Configured ${context} worker to: pdf.worker.js (webpack alias)`);
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
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
    if (pdfjs && pdfjs.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = "pdf.worker.js";
      console.log(`[pdf-worker] Configured pdfjs-dist worker for pdf-parse to: pdf.worker.js`);
    }
  } catch (error) {
    console.warn(`[pdf-worker] Could not configure pdfjs-dist for pdf-parse:`, error);
  }

  const pdfParseClass = (pdfParseModule as { PDFParse?: { setWorker?: (src: string) => string | void } }).PDFParse;

  if (pdfParseClass && typeof pdfParseClass.setWorker === "function") {
    // Use the webpack alias - same as pdfjs-dist
    const configuredSrc = pdfParseClass.setWorker("pdf.worker.js");
    if (configuredSrc !== undefined) {
      console.log(`[pdf-worker] pdf-parse worker configured to: ${configuredSrc}`);
    } else {
      console.log(`[pdf-worker] pdf-parse worker configured to: pdf.worker.js`);
    }
  }
}
