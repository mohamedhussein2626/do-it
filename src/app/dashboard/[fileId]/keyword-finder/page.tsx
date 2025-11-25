"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Search } from "lucide-react";
import { getFileData } from "@/lib/actions";
import PDFSidebar from "@/components/layout/PDFSidebar";
import FileViewer from "@/components/FileViewer";
import QuickNavTabs from "@/components/dashboard/QuickNavTabs";
import BannedUserProtection from "@/components/BannedUserProtection";

interface KeywordFrequency {
  word: string;
  count: number;
}

interface FileData {
  id: string;
  name: string;
  url: string;
  key: string | null;
  fileType: string | null;
}

export default function KeywordFinderPage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const [fileId, setFileId] = useState<string>("");
  const [file, setFile] = useState<FileData | null>(null);
  const [keywords, setKeywords] = useState<KeywordFrequency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("keyword-finder");

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

      // Fetch keyword frequencies
      const response = await fetch("/api/pdf-tools/keyword-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: id, topN: 20 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get keyword frequencies");
      }

      const data = await response.json();
      setKeywords(data.keywords || []);
    } catch (error) {
      console.error("Error fetching keyword frequencies:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load keyword frequencies"
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate max count for bar chart scaling
  const maxCount = keywords.length > 0 ? keywords[0].count : 1;

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
              <p className="text-gray-600">Analyzing keywords...</p>
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
              <Search className="w-8 h-8 mx-auto mb-4 text-red-400" />
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
            <QuickNavTabs fileId={fileId} currentPage="keyword-finder" />
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto w-full">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Keyword Finder
                  </h1>
                  <p className="text-gray-600">
                    Top 20 most frequent words (excluding stopwords)
                  </p>
                </div>

                {keywords.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No keywords found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Bar Chart */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Frequency Chart
                      </h2>
                      <div className="space-y-3">
                        {keywords.map((item, index) => {
                          const percentage = (item.count / maxCount) * 100;
                          return (
                            <div key={index} className="flex items-center space-x-4">
                              <div className="w-32 text-sm font-medium text-gray-700 truncate">
                                {item.word}
                              </div>
                              <div className="flex-1 relative">
                                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                    style={{ width: `${percentage}%` }}
                                  >
                                    <span className="text-xs font-semibold text-white">
                                      {item.count}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-16 text-right text-sm font-semibold text-gray-900">
                                {item.count}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* List View */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Keyword List
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {keywords.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600">
                                  {index + 1}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900">
                                {item.word}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-600">
                              {item.count}x
                            </span>
                          </div>
                        ))}
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
                <FileViewer file={file} showFullText={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BannedUserProtection>
  );
}

