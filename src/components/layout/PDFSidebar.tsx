"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Headphones,
  Brain,
  CreditCard,
  FileAudio,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BillingModal from "../BillingModal";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

interface QuizPanelProps {
  quiz: Quiz | null;
}

interface PDFSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  fileId: string;
  setLoading: (loading: boolean) => void;
  setLoadingMessage?: (message: string) => void;
  onToggleSidebar?: () => void;
}

export function QuizPanel({ quiz }: QuizPanelProps) {
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  if (!quiz) return null;

  return (
    <div>
      <h2>{quiz.title}</h2>
      {quiz.questions.map((q, idx) => (
        <div key={q.id} style={{ marginBottom: 24 }}>
          <div>
            <b>Question {idx + 1}:</b> {q.question}
          </div>
          {q.options.map((opt, oidx) => (
            <div key={oidx}>
              <label>
                <input
                  type="radio"
                  name={`q${idx}`}
                  value={opt}
                  checked={selected[idx] === opt}
                  onChange={() =>
                    setSelected((prev) => ({ ...prev, [idx]: opt }))
                  }
                  disabled={showResult}
                />
                {opt}
              </label>
            </div>
          ))}
          {showResult && (
            <div>
              {selected[idx] === q.answer ? (
                <span style={{ color: "green" }}>Correct!</span>
              ) : (
                <span style={{ color: "red" }}>
                  Incorrect. Correct answer: {q.answer}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
      {!showResult && (
        <button onClick={() => setShowResult(true)}>Submit</button>
      )}
    </div>
  );
}

const PDFSidebar: React.FC<Omit<PDFSidebarProps, "setSidebarOpen">> = ({
  sidebarOpen,
  activeView,
  setActiveView,
  fileId,
  setLoading,
  setLoadingMessage,
  onToggleSidebar,
}) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  // Use a ref to always have the latest fileId (avoid closure issues)
  // Initialize ref with current fileId prop
  const fileIdRef = useRef<string>(fileId);

  // Update ref immediately whenever fileId prop changes (synchronous update)
  // This ensures we always have the latest fileId, even if handleNav is called immediately
  useEffect(() => {
    console.log("📌 PDFSidebar fileId prop changed from", fileIdRef.current, "to", fileId);
    fileIdRef.current = fileId;
  }, [fileId]);

  const pdfSidebarItems = [
    { id: "chatbot", icon: MessageSquare, label: "Chat Bot" },
    { id: "podcast", icon: Headphones, label: "Podcast" },
    { id: "flashcards", icon: CreditCard, label: "Flashcards" },
    { id: "quiz", icon: Brain, label: "Quiz" },
    { id: "transcript", icon: FileAudio, label: "Transcript" },
  ];



  const handleNav = async (itemId: string) => {
    // Use the fileId prop directly (most up-to-date) or fallback to ref
    // The prop is always the latest value from parent component
    const currentFileId = fileId || fileIdRef.current;
    console.log("🚀 Navigation clicked:", itemId);
    console.log("📁 PDFSidebar - fileId from props:", fileId);
    console.log("📁 PDFSidebar - fileId from ref:", fileIdRef.current);
    console.log("📁 PDFSidebar - Using fileId:", currentFileId);

    if (!currentFileId) {
      console.error("❌ No fileId available for navigation!");
      setError("No file selected. Please select a file first.");
      return;
    }

    setActiveView(itemId);

    // For generation pages, trigger individual API based on feature
    if (
      itemId === "quiz" ||
      itemId === "flashcards" ||
      itemId === "transcript" ||
      itemId === "podcast"
    ) {
      setLoading(true);
      setLoadingMessage?.(
        itemId === "quiz" ? "Generating Quiz..." :
          itemId === "flashcards" ? "Generating Flashcards..." :
            itemId === "transcript" ? "Generating Transcript..." :
              "Generating Podcast..."
      );
      setError(null);

      // Navigate immediately to the page using current fileId
      const targetUrl = `/dashboard/${currentFileId}/${itemId}`;
      console.log("🔗 Navigating to:", targetUrl);
      router.push(targetUrl);

      // Call the appropriate individual API
      try {
        // Determine which API endpoint to call
        const endpoint =
          itemId === "quiz"
            ? "/api/create-quiz"
            : itemId === "flashcards"
              ? "/api/create-flashcards"
              : itemId === "transcript"
                ? "/api/create-transcript"
                : "/api/create-podcast";

        console.log(`📤 Calling ${endpoint} API with fileId:`, currentFileId);
        const response = await fetch(endpoint, {
          method: "POST",
          body: JSON.stringify({ fileId: currentFileId }),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          let errorData: { error?: string; details?: string; suggestion?: string } = {};
          try {
            const text = await response.text();
            if (text) {
              try {
                errorData = JSON.parse(text);
              } catch {
                // If not JSON, use the text as error message
                errorData = { error: text || response.statusText || "Unknown error" };
              }
            } else {
              errorData = { error: response.statusText || "Unknown error" };
            }
          } catch {
            // If response parsing fails, use status text
            errorData = { error: response.statusText || "Unknown error" };
          }

          // Only log if we have meaningful error data
          if (errorData.error && errorData.error !== "Unknown error" && errorData.error.trim().length > 0) {
            console.warn(`${itemId} generation failed:`, errorData.error);
            if (errorData.details) {
              console.warn("Error details:", errorData.details);
            }
          } else {
            console.warn(`${itemId} generation failed with unknown error`);
          }

          // Don't throw error - just log it since user has already navigated
          // The page will handle showing appropriate state
        } else {
          // Only parse JSON if response was successful
          const data = await response.json();
          console.log(`${itemId} generated successfully:`, data);
        }
      } catch (err) {
        const errorObj = err as Error;
        // Only log meaningful errors, don't block user with error state
        // User has already navigated to the page
        if (errorObj.message && !errorObj.message.includes("Unknown error")) {
          console.warn(`Error creating ${itemId} (background):`, errorObj.message);
        }
        // Don't set error state - let the page handle its own loading/error states
      } finally {
        setLoading(false);
      }
    } else if (itemId === "chatbot") {
      const currentFileId = fileId || fileIdRef.current;
      console.log("💬 Chatbot clicked, using fileId:", currentFileId);
      router.push(`/dashboard/${currentFileId}/chatbot`);
    } else {
      const currentFileId = fileId || fileIdRef.current;
      console.log("🔄 Other view clicked, using fileId:", currentFileId);
      router.push(`/dashboard/${currentFileId}?view=${itemId}`);
    }
  };

  return (
    <>
      <div
        className={`${sidebarOpen ? "w-64" : "w-16"
          } bg-white border-r border-gray-200 transition-all duration-300 fixed top-16 left-0 h-[calc(100vh-4rem)] flex flex-col overflow-hidden z-40`}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.png"
                alt="NotebookLama Logo"
                width={32}
                height={24}
                className="rounded-sm"
              />
              {sidebarOpen && (
                <span className="font-bold text-lg text-gray-800">
                  NotebookLama
                </span>
              )}
            </Link>
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          <div className="py-4 space-y-1">
            {pdfSidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${activeView === item.id
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                    : "text-gray-700 hover:text-gray-900"
                  }`}
                type="button"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </button>
            ))}





            {/* Error State */}
            {error && (
              <div className="px-4 py-2 text-sm text-red-600">{error}</div>
            )}
          </div>
        </nav>
      </div>

      {/* Billing Modal */}
      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
      />
    </>
  );
};

export default PDFSidebar;
