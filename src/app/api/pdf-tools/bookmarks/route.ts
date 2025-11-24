import { NextRequest, NextResponse } from "next/server";
// Import polyfills FIRST before any pdf-parse usage
import "@/lib/init-polyfills";
import { generateBookmarks } from "@/lib/pdf-tools";

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

    const bookmarks = await generateBookmarks(fileId);

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("Error generating bookmarks:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Return default bookmarks instead of error to prevent UI from breaking
    return NextResponse.json({ 
      bookmarks: [{ title: "Page 1", page: 1 }],
      error: error instanceof Error ? error.message : "Failed to generate bookmarks",
    });
  }
}

