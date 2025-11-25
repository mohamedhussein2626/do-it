"use client";

import React from "react";
import PdfRenderer from "@/components/PdfRenderer";
import TextContentViewer from "@/components/TextContentViewer";
import { FileText, Download } from "lucide-react";
import { Button } from "./ui/button";
import { getAbsoluteFileUrl } from "@/lib/file-url-utils";
import Image from "next/image";

interface FileViewerProps {
  file: {
    id: string;
    url: string;
    key: string | null;
    fileType: string | null;
    name: string;
  };
  showFullText?: boolean; // If true, show full text content (for tools). If false, use PDF renderer (for chat bot)
}

const FileViewer: React.FC<FileViewerProps> = ({ file, showFullText = false }) => {
  const isPDF = file.fileType === "application/pdf";
  const isWord = 
    file.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.fileType === "application/msword";
  const isText = file.fileType === "text/plain";
  const isMarkdown = file.fileType === "text/markdown";
  const isImage = file.fileType?.startsWith("image/");

  // For PDF files: 
  // - If showFullText is true (tools pages), show full text content
  // - If showFullText is false (chat bot), use PDF renderer with page navigation
  if (isPDF) {
    if (showFullText) {
      return <TextContentViewer file={file} />;
    } else {
      return <PdfRenderer url={getAbsoluteFileUrl(file.url, file.key)} />;
    }
  }

  // For Word files, show content viewer
  if (isWord) {
    return <TextContentViewer file={file} />;
  }

  // For text files, show content viewer
  if (isText) {
    return <TextContentViewer file={file} />;
  }

  // For Markdown files, show content viewer
  if (isMarkdown) {
    return <TextContentViewer file={file} />;
  }

  // For images, show the image
  if (isImage) {
    const fileUrl = getAbsoluteFileUrl(file.url, file.key);
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg p-4">
        <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
          <Image
            src={fileUrl}
            alt={file.name}
            fill
            sizes="(max-width: 768px) 100vw, 75vw"
            className="object-contain rounded-lg shadow-lg"
            unoptimized
            priority
          />
        </div>
      </div>
    );
  }

  // For unknown file types, show a generic message
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center p-8 max-w-md">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          File Preview Not Available
        </h3>
        <p className="text-gray-600 mb-4">
          {file.name}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This file type cannot be previewed, but the content is available for chat and other features.
        </p>
        <Button
          onClick={() => {
            const fileUrl = getAbsoluteFileUrl(file.url, file.key);
            window.open(fileUrl, "_blank");
          }}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download File
        </Button>
      </div>
    </div>
  );
};

export default FileViewer;

