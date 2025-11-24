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
    GlobalWorkerOptions?: { workerSrc?: string };
    disableWorker?: boolean;
  };

  if (instance.GlobalWorkerOptions) {
    if (instance.GlobalWorkerOptions.workerSrc !== WORKER_SRC_PLACEHOLDER) {
      console.log(`[pdf-worker] Configuring ${context} worker placeholder`);
      instance.GlobalWorkerOptions.workerSrc = WORKER_SRC_PLACEHOLDER;
    }
  }

  if (instance.disableWorker !== true) {
    instance.disableWorker = true;
  }
}

export function configurePdfParseWorker(pdfParseModule: unknown) {
  if (!isServerEnvironment() || !pdfParseModule) {
    return;
  }

  registerGlobalWorker();

  const pdfParseClass = (pdfParseModule as { PDFParse?: { setWorker?: (src: string) => string | void } }).PDFParse;

  if (pdfParseClass && typeof pdfParseClass.setWorker === "function") {
    const configuredSrc = pdfParseClass.setWorker(WORKER_SRC_PLACEHOLDER);
    if (configuredSrc) {
      console.log(`[pdf-worker] pdf-parse worker configured: ${configuredSrc}`);
    }
  }
}
