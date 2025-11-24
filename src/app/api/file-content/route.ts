import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { db } from "@/db";
import { extractTextFromFile } from "@/lib/pdf-tools";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2-config";
import { Readable } from "stream";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Verify user owns the file and get file details
    const file = await db.file.findFirst({
      where: { id: fileId, userId: sessionUser.user.id },
      select: { 
        id: true, 
        fileType: true, 
        key: true,
        name: true,
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: "File not found or access denied" },
        { status: 404 }
      );
    }

    // First, try to fetch chunks for the file
    const chunks = await db.chunk.findMany({
      where: { fileId },
      take: 1000, // Get up to 1000 chunks to ensure we get all content
      orderBy: { createdAt: "asc" },
      select: { text: true },
    });

    // Combine all chunks into one content string
    let content = chunks.map((chunk) => chunk.text).join("\n\n");

    // If no chunks or content is empty, extract text directly from the file
    if (!content || content.trim().length === 0) {
      console.log(`📦 No chunks found for file ${fileId}, extracting directly from file...`);
      
      try {
        // Get file buffer from R2 storage
        if (!file.key) {
          throw new Error("File key is missing");
        }

        // Get file from R2
        const command = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: file.key,
        });

        const response = await r2Client.send(command);
        if (!response.Body) {
          throw new Error("Failed to fetch file from storage");
        }

        // Convert stream to buffer
        const chunks: Uint8Array[] = [];
        const stream = response.Body as Readable;
        
        for await (const chunk of stream) {
          chunks.push(chunk as Uint8Array);
        }
        const fileBuffer = Buffer.concat(chunks);
        
        console.log(`📦 File buffer retrieved: ${fileBuffer.length} bytes, type: ${file.fileType}`);
        
        // Extract text using the same method as the tools
        const extractionResult = await extractTextFromFile(fileBuffer, file.fileType || null);
        
        if (extractionResult.text && extractionResult.text.trim().length > 0) {
          content = extractionResult.text;
          console.log(`✅ Extracted ${content.length} characters directly from file`);
        } else {
          console.warn(`⚠️ No text extracted from file ${fileId}`);
        }
      } catch (extractError) {
        console.error(`❌ Error extracting text from file ${fileId}:`, extractError);
        // Continue with empty content - will be handled by the client
      }
    }

    return NextResponse.json({
      success: true,
      content: content || "",
      chunkCount: chunks.length,
    });
  } catch (error) {
    console.error("Error fetching file content:", error);
    return NextResponse.json(
      { error: "Failed to fetch file content" },
      { status: 500 }
    );
  }
}

