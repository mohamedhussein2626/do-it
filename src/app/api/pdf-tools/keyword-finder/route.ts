import { NextRequest, NextResponse } from "next/server";
// Import polyfills FIRST before any pdf-parse usage
import "@/lib/init-polyfills";
import { getKeywordFrequencies } from "@/lib/pdf-tools";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, topN } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: "fileId is required" },
        { status: 400 }
      );
    }

    const keywords = await getKeywordFrequencies(fileId, topN || 20);

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error("Error getting keyword frequencies:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Return empty array instead of error to prevent UI from breaking
    return NextResponse.json({ 
      keywords: [],
      error: error instanceof Error ? error.message : "Failed to get keyword frequencies",
    });
  }
}

