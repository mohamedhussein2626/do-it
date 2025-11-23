"use client";

import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { toast } from "sonner";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import SimpleBar from "simplebar-react";
import PdfFullscreen from "./PdfFullscreen";
import { useEffect, useMemo } from "react";
import { initializePdfWorker } from "@/lib/pdfjs-worker";

interface PdfRendererProps {
  url: string;
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [workerReady, setWorkerReady] = useState(false);

  const isLoading = renderedScale !== scale;

  // Ensure worker is configured on client side - MUST be set before Document renders
  useEffect(() => {
    if (typeof window !== "undefined") {
      initializePdfWorker()
        .then(() => {
          setWorkerReady(true);
        })
        .catch((error) => {
          console.error("Failed to initialize PDF.js worker:", error);
          // Set ready anyway - Document will handle errors gracefully
          setWorkerReady(true);
        });
    }
  }, []);

  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  console.log(errors);

  const { width, ref } = useResizeDetector();

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrPage(Number(page));
    setValue("page", String(page));
  };

  // Memoize file object to prevent re-renders
  const fileConfig = useMemo(() => ({
    url: url,
    httpHeaders: {
      'Accept': 'application/pdf',
    },
    withCredentials: false,
  }), [url]);

  // Memoize options to prevent re-renders
  const pdfOptions = useMemo(() => {
    const version = pdfjs.version || "3.4.120";
    return {
      cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/standard_fonts/`,
      // Disable auto fetch to prevent unnecessary requests
      disableAutoFetch: false,
      disableStream: false,
    };
  }, []);

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            disabled={currPage <= 1}
            onClick={() => {
              setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
              setValue("page", String(currPage - 1));
            }}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500",
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>

          <Button
            disabled={numPages === undefined || currPage === numPages}
            onClick={() => {
              setCurrPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1,
              );
              setValue("page", String(currPage + 1));
            }}
            variant="ghost"
            aria-label="next page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                <Search className="h-4 w-4" />
                {scale * 100}%
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setRotation((prev) => prev + 90)}
            variant="ghost"
            aria-label="rotate 90 degrees"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <PdfFullscreen fileUrl={url} />
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            {!workerReady ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Initializing PDF viewer...</p>
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] p-8">
                <div className="text-center max-w-md">
                  <p className="text-red-600 font-semibold mb-2">Failed to load PDF file</p>
                  <p className="text-gray-600 text-sm mb-4">{loadError}</p>
                  <Button
                    onClick={() => {
                      setLoadError(null);
                      window.location.reload();
                    }}
                    variant="outline"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <Document
              key={url} // Add key to prevent re-renders when URL is the same
              onLoadError={(error) => {
                console.error("PDF load error details:", error);
                console.error("PDF URL:", url);
                console.error("Error name:", error?.name);
                console.error("Error message:", error?.message);
                
                // Ignore struct tree errors - they're non-critical
                const errorMessage = error?.message || error?.name || "Unknown error";
                if (errorMessage.includes("sendWithPromise") || errorMessage.includes("struct tree") || errorMessage.includes("getStructTree")) {
                  console.warn("Struct tree error (non-critical), ignoring:", errorMessage);
                  // Don't set error for struct tree issues - PDF can still render
                  return;
                }
                
                // Provide more helpful error messages
                let userErrorMessage = "Unknown error";
                if (error?.message) {
                  userErrorMessage = error.message;
                } else if (error?.name) {
                  userErrorMessage = error.name;
                }
                
                // Check if it's a network/CORS issue
                if (userErrorMessage.includes("Failed to fetch") || userErrorMessage.includes("NetworkError")) {
                  userErrorMessage = "Failed to load PDF. Please check your connection and try again.";
                } else if (userErrorMessage.includes("Invalid PDF") || userErrorMessage.includes("Invalid PDF structure")) {
                  userErrorMessage = "The PDF file appears to be corrupted or invalid. Please try uploading it again.";
                }
                
                setLoadError(userErrorMessage);
                toast.error(`Error loading PDF: ${userErrorMessage}`);
              }}
              onLoadSuccess={({ numPages }) => {
                console.log("PDF loaded successfully:", numPages, "pages");
                setNumPages(numPages);
                setLoadError(null); // Clear any previous errors
              }}
              file={fileConfig}
              options={pdfOptions}
              className="max-h-full"
              error={
                <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] p-8">
                  <div className="text-center max-w-md">
                    <p className="text-red-600 font-semibold mb-2">Failed to load PDF</p>
                    <p className="text-gray-600 text-sm mb-4">Please try refreshing the page</p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
              }
            >
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={currPage}
                  scale={scale}
                  rotate={rotation}
                  key={"@" + renderedScale}
                />
              ) : null}

              <Page
                className={cn(isLoading ? "hidden" : "")}
                width={width ? width : 1}
                pageNumber={currPage}
                scale={scale}
                rotate={rotation}
                key={"@" + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
                onRenderError={(error) => {
                  // Ignore struct tree errors - they're non-critical
                  const errorMsg = error?.message || String(error);
                  if (errorMsg.includes("sendWithPromise") || errorMsg.includes("struct tree") || errorMsg.includes("getStructTree")) {
                    console.warn("Page render error (non-critical struct tree):", errorMsg);
                    return; // Don't show error for struct tree issues
                  }
                  console.error("Page render error:", error);
                }}
              />
            </Document>
            )}
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
