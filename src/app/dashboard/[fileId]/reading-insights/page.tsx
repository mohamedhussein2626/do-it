"use client";

import React, { useState, useEffect } from "react";
import { Loader2, BarChart3, FileText, Clock, BookOpen } from "lucide-react";
import { getFileData } from "@/lib/actions";
import PDFSidebar from "@/components/layout/PDFSidebar";
import FileViewer from "@/components/FileViewer";
import QuickNavTabs from "@/components/dashboard/QuickNavTabs";
import BannedUserProtection from "@/components/BannedUserProtection";

interface ReadingInsights {
  totalWordCount: number;
  totalCharacterCount: number;
  totalPages: number;
  estimatedReadingTime: number;
  averageWordsPerPage: number;
}

interface FileData {
  id: string;
  name: string;
  url: string;
  key: string | null;
  fileType: string | null;
}

export default function ReadingInsightsPage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const [fileId, setFileId] = useState<string>("");
  const [file, setFile] = useState<FileData | null>(null);
  const [insights, setInsights] = useState<ReadingInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("reading-insights");

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setFileId(resolvedParams.fileId);
      await fetchData(resolvedParams.fileId);
    };

    resolveParams();
  }, [params]);

  const fetchData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch file data
      const fileData = await getFileData(id);
      if (!fileData.file) {
        setError("File not found");
        return;
      }

      setFile({
        id: fileData.file.id,
        name: fileData.file.name,
        url: fileData.file.url,
        key: fileData.file.key,
        fileType: fileData.file.fileType,
      });

      // Fetch reading insights
      const response = await fetch("/api/pdf-tools/reading-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get reading insights");
      }

      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error("Error fetching reading insights:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load reading insights"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BannedUserProtection>
        <div className="flex h-screen">
          <PDFSidebar
            sidebarOpen={sidebarOpen}
            activeView={activeView}
            setActiveView={setActiveView}
            fileId={fileId}
            setLoading={() => {}}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          <div
            className={`flex-1 flex items-center justify-center ${
              sidebarOpen ? "ml-64" : "ml-16"
            } transition-all duration-300`}
          >
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Analyzing document...</p>
            </div>
          </div>
        </div>
      </BannedUserProtection>
    );
  }

  if (error || !file) {
    return (
      <BannedUserProtection>
        <div className="flex h-screen">
          <PDFSidebar
            sidebarOpen={sidebarOpen}
            activeView={activeView}
            setActiveView={setActiveView}
            fileId={fileId}
            setLoading={() => {}}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          <div
            className={`flex-1 flex items-center justify-center ${
              sidebarOpen ? "ml-64" : "ml-16"
            } transition-all duration-300`}
          >
            <div className="text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-4 text-red-400" />
              <p className="text-red-600 mb-4">{error || "File not found"}</p>
            </div>
          </div>
        </div>
      </BannedUserProtection>
    );
  }

  return (
    <BannedUserProtection>
      <div className="flex h-screen">
        <PDFSidebar
          sidebarOpen={sidebarOpen}
          activeView={activeView}
          setActiveView={setActiveView}
          fileId={fileId}
          setLoading={() => {}}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div
          className={`flex-1 flex flex-col ${
            sidebarOpen ? "ml-64" : "ml-16"
          } transition-all duration-300`}
        >
          <div className="w-full border-b border-gray-200">
            <QuickNavTabs fileId={fileId} currentPage="reading-insights" />
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto w-full">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Reading Insights
                  </h1>
                  <p className="text-gray-600">
                    Comprehensive analysis of your document
                  </p>
                </div>

                {insights && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Total Word Count */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">
                              Total Words
                            </h3>
                            <p className="text-2xl font-bold text-gray-900">
                              {insights.totalWordCount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Character Count */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileText className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">
                              Total Characters
                            </h3>
                            <p className="text-2xl font-bold text-gray-900">
                              {insights.totalCharacterCount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Pages */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">
                              Total Pages
                            </h3>
                            <p className="text-2xl font-bold text-gray-900">
                              {insights.totalPages}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Estimated Reading Time */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Clock className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">
                              Reading Time
                            </h3>
                            <p className="text-2xl font-bold text-gray-900">
                              {insights.estimatedReadingTime} min
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              @ 200 words/min
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Average Words Per Page */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm md:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">
                              Average Words Per Page
                            </h3>
                            <p className="text-2xl font-bold text-gray-900">
                              {insights.averageWordsPerPage.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* File Viewer Sidebar */}
            <div className="w-96 border-l border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Document Preview</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <FileViewer file={file} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BannedUserProtection>
  );
}

