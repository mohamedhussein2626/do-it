"use client";

import React, { useState, useEffect } from "react";
import { Loader2, BookOpen, FileText } from "lucide-react";
import { getFileData } from "@/lib/actions";
import PDFSidebar from "@/components/layout/PDFSidebar";
import FileViewer from "@/components/FileViewer";
import QuickNavTabs from "@/components/dashboard/QuickNavTabs";
import BannedUserProtection from "@/components/BannedUserProtection";

interface Bookmark {
  title: string;
  page: number;
}

interface FileData {
  id: string;
  name: string;
  url: string;
  key: string | null;
}

export default function BookmarksPage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const [fileId, setFileId] = useState<string>("");
  const [file, setFile] = useState<FileData | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("bookmarks");

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
      });

      // Fetch bookmarks
      const response = await fetch("/api/pdf-tools/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate bookmarks");
      }

      const data = await response.json();
      setBookmarks(data.bookmarks || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load bookmarks"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkClick = (page: number) => {
    // Scroll to page in PDF viewer
    // This would require integration with the PDF viewer component
    // For now, we'll just log it
    console.log("Navigate to page:", page);
    // You can enhance this to actually navigate the PDF viewer
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
              <p className="text-gray-600">Generating bookmarks...</p>
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
              <BookOpen className="w-8 h-8 mx-auto mb-4 text-red-400" />
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
            <QuickNavTabs fileId={fileId} currentPage="bookmarks" />
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto w-full">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Auto Bookmarks
                  </h1>
                  <p className="text-gray-600">
                    Table of contents generated from your document
                  </p>
                </div>

                {bookmarks.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No bookmarks found</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            Table of Contents
                          </h2>
                          <p className="text-sm text-gray-500">
                            {bookmarks.length} sections found
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                      {bookmarks.map((bookmark, index) => (
                        <button
                          key={index}
                          onClick={() => handleBookmarkClick(bookmark.page)}
                          className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                              <span className="text-sm font-semibold text-blue-600">
                                {bookmark.page}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {bookmark.title}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Page {bookmark.page}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                          </div>
                        </button>
                      ))}
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

