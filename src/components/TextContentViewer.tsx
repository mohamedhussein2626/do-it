"use client";

import React, { useState, useEffect } from "react";
import { Loader2, FileText, Download } from "lucide-react";
import { Button } from "./ui/button";
import { getAbsoluteFileUrl } from "@/lib/file-url-utils";
import SimpleBar from "simplebar-react";

interface TextContentViewerProps {
  file: {
    id: string;
    url: string;
    key: string | null;
    fileType: string | null;
    name: string;
  };
}

const TextContentViewer: React.FC<TextContentViewerProps> = ({ file }) => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/file-content?fileId=${file.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch file content");
        }
        
        const data = await response.json();
        
        if (data.success && data.content) {
          setContent(data.content);
        } else {
          throw new Error("No content available");
        }
      } catch (err) {
        console.error("Error fetching file content:", err);
        setError(err instanceof Error ? err.message : "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [file.id]);

  const fileUrl = getAbsoluteFileUrl(file.url, file.key);
  const isMarkdown = file.fileType === "text/markdown";

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading file content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-8 max-w-md">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Content Not Available
          </h3>
          <p className="text-gray-600 mb-4">
            {file.name}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {error || "Unable to load file content. The file may not have been processed yet."}
          </p>
          <Button
            onClick={() => {
              window.open(fileUrl, "_blank");
            }}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download Original File
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col h-full">
      {/* Header */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-900">{file.name}</span>
        </div>
        <Button
          onClick={() => {
            window.open(fileUrl, "_blank");
          }}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <SimpleBar autoHide={false} className="h-full">
          <div className="p-6">
            {isMarkdown ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  {content}
                </pre>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed text-sm">
                {content}
              </pre>
            )}
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default TextContentViewer;

