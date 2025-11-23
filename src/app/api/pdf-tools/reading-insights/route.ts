import { NextRequest, NextResponse } from "next/server";
// Import polyfills FIRST before any pdf-parse usage
import "@/lib/dom-polyfills";
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
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get reading insights",
      },
      { status: 500 }
    );
  }
}

