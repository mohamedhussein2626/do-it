"use client";

import React from "react";
import PdfRenderer from "@/components/PdfRenderer";
import TextContentViewer from "@/components/TextContentViewer";
import { FileText, Download } from "lucide-react";
import { Button } from "./ui/button";
import { getAbsoluteFileUrl } from "@/lib/file-url-utils";

interface FileViewerProps {
  file: {
    id: string;
    url: string;
    key: string | null;
    fileType: string | null;
    name: string;
  };
}

const FileViewer: React.FC<FileViewerProps> = ({ file }) => {
  const isPDF = file.fileType === "application/pdf";
  const isWord = 
    file.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.fileType === "application/msword";
  const isText = file.fileType === "text/plain";
  const isMarkdown = file.fileType === "text/markdown";
  const isImage = file.fileType?.startsWith("image/");

  // For PDF files, use the PDF renderer
  if (isPDF) {
    return <PdfRenderer url={getAbsoluteFileUrl(file.url, file.key)} />;
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
        <img
          src={fileUrl}
          alt={file.name}
          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
        />
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

