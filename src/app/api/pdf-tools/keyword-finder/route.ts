import { NextRequest, NextResponse } from "next/server";
// Import polyfills FIRST before any pdf-parse usage
import "@/lib/dom-polyfills";
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
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get keyword frequencies",
      },
      { status: 500 }
    );
  }
}

