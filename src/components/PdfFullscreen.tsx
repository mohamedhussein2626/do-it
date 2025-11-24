"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useResizeDetector } from "react-resize-detector";
import { toast } from "sonner";
import { initializePdfWorker } from "@/lib/pdfjs-worker";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface PdfFullscreenProps {
  fileUrl: string;
}

const PdfFullscreen = ({ fileUrl }: PdfFullscreenProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>();
  const [workerReady, setWorkerReady] = useState(false);

  const { width, ref } = useResizeDetector();

  // Ensure worker is configured on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      initializePdfWorker()
        .then(() => {
          setWorkerReady(true);
        })
        .catch((error) => {
          console.error("Failed to initialize PDF.js worker:", error);
          setWorkerReady(true); // Set ready anyway
        });
    }
  }, []);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button variant="ghost" className="gap-1.5" aria-label="fullscreen">
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full">
        <VisuallyHidden.Root>
          <DialogTitle>Fullscreen PDF preview</DialogTitle>
        </VisuallyHidden.Root>
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
          <div ref={ref}>
            {!workerReady ? (
              <div className="flex justify-center">
                <Loader2 className="my-24 h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Document
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onLoadError={() => {
                  toast.error("Error Loading PDF");
                }}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                file={fileUrl}
                options={{
                  cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
                  cMapPacked: true,
                  standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`,
                }}
                className="max-h-full"
              >
                {new Array(numPages).fill(0).map((_, i) => (
                  <Page key={i} width={width ? width : 1} pageNumber={i + 1} />
                ))}
              </Document>
            )}
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PdfFullscreen;
