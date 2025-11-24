declare module "pdfjs-dist/legacy/build/pdf.worker.js" {
  const worker: {
    WorkerMessageHandler?: unknown;
    [key: string]: unknown;
  };
  export default worker;
}

declare module "pdfjs-dist/build/pdf.worker.js" {
  const worker: {
    WorkerMessageHandler?: unknown;
    [key: string]: unknown;
  };
  export default worker;
}

