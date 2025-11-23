import { NextRequest, NextResponse } from "next/server";
// Import polyfills FIRST before any pdf-parse usage
import "@/lib/dom-polyfills";
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
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate bookmarks",
      },
      { status: 500 }
    );
  }
}

