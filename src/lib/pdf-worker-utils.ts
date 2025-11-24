import fs from "fs";
import path from "path";

let cachedWorkerSrc: string | null = null;
let warnedMissingWorker = false;
let globalWorkerRegistered = false;

interface GlobalPdfWorkerScope {
  pdfjsWorker?: unknown;
}

function isServerEnvironment() {
  return typeof window === "undefined" && typeof process !== "undefined";
}

function findExistingPath(candidate: string) {
  try {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  } catch (error) {
    console.warn(`[pdf-worker] Failed checking path "${candidate}":`, error);
  }
  return null;
}

export function getServerPdfWorkerSrc(): string | null {
  if (!isServerEnvironment()) {
    return null;
  }

  if (cachedWorkerSrc) {
    return cachedWorkerSrc;
  }

  const projectRoot = process.cwd();
  const candidates = [
    path.join(projectRoot, "node_modules/pdfjs-dist/legacy/build/pdf.worker.js"),
    path.join(projectRoot, "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
    path.join(projectRoot, "node_modules/pdfjs-dist/build/pdf.worker.js"),
    path.join(projectRoot, "node_modules/pdfjs-dist/build/pdf.worker.mjs"),
  ];

  for (const candidate of candidates) {
    const resolved = findExistingPath(candidate);
    if (resolved) {
      cachedWorkerSrc = resolved;
      console.log(`[pdf-worker] Using worker at ${resolved}`);
      return cachedWorkerSrc;
    }
  }

  if (!warnedMissingWorker) {
    warnedMissingWorker = true;
    console.warn(
      "[pdf-worker] Could not locate pdf.worker.js. pdfjs-dist may fail to extract pages."
    );
  }

  return null;
}

function registerGlobalWorker(workerSrc: string) {
  if (globalWorkerRegistered) {
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const workerModule = require(workerSrc);
    (globalThis as GlobalPdfWorkerScope).pdfjsWorker = workerModule;
    globalWorkerRegistered = true;
    console.log(`[pdf-worker] Registered global worker handler from ${workerSrc}`);
  } catch (error) {
    console.warn(`[pdf-worker] Failed to register global worker handler:`, error);
  }
}

export function configurePdfjsWorker(pdfjsInstance: unknown, context = "pdfjs") {
  if (!isServerEnvironment() || !pdfjsInstance) {
    return;
  }

  const workerSrc = getServerPdfWorkerSrc();
  if (!workerSrc) {
    return;
  }

  registerGlobalWorker(workerSrc);

  const instance = pdfjsInstance as {
    GlobalWorkerOptions?: { workerSrc?: string };
    disableWorker?: boolean;
  };

  if (instance.GlobalWorkerOptions) {
    if (instance.GlobalWorkerOptions.workerSrc !== workerSrc) {
      console.log(`[pdf-worker] Configuring ${context} worker to ${workerSrc}`);
      instance.GlobalWorkerOptions.workerSrc = workerSrc;
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

  const workerSrc = getServerPdfWorkerSrc();
  if (!workerSrc) {
    return;
  }

  registerGlobalWorker(workerSrc);

  const pdfParseClass = (pdfParseModule as { PDFParse?: { setWorker?: (src: string) => string | void } }).PDFParse;

  if (pdfParseClass && typeof pdfParseClass.setWorker === "function") {
    const configuredSrc = pdfParseClass.setWorker(workerSrc);
    if (configuredSrc) {
      console.log(`[pdf-worker] pdf-parse worker configured: ${configuredSrc}`);
    }
  }
}


