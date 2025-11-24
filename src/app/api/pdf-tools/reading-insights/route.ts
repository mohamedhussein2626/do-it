import { NextRequest, NextResponse } from "next/server";
// Import polyfills FIRST before any pdf-parse usage
import "@/lib/init-polyfills";
import { getReadingInsights } from "@/lib/pdf-tools";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: "fileId is required" },
        { status: 400 }
      );
    }

    const insights = await getReadingInsights(fileId);

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error getting reading insights:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Return default values instead of error to prevent UI from breaking
    return NextResponse.json({
      totalWordCount: 0,
      totalCharacterCount: 0,
      totalPages: 1,
      estimatedReadingTime: 0,
      averageWordsPerPage: 0,
      error: error instanceof Error ? error.message : "Failed to get reading insights",
    });
  }
}

