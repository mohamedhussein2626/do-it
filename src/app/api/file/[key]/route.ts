import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2-config";
import { getServerSession } from "@/lib/auth-api";
import { db } from "@/db";
import { Readable } from "stream";

// Force Node.js runtime for file serving
export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute for file serving

/**
 * Handle OPTIONS request for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Range",
      "Access-Control-Max-Age": "86400",
    },
  });
}

/**
 * Serve files from R2 with authentication check
 * This ensures users can only access their own files
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    // Get the file key from params (URL decoded)
    const { key } = await params;
    // Handle both encoded and decoded keys
    let decodedKey = key;
    try {
      decodedKey = decodeURIComponent(key);
    } catch {
      // If decode fails, use original key
      decodedKey = key;
    }

    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the file belongs to the user
    let file;
    try {
      file = await db.file.findFirst({
        where: {
          key: decodedKey,
          userId: session.user.id,
        },
        select: {
          id: true,
          fileType: true,
          key: true,
        },
      });
    } catch (dbError: unknown) {
      console.error("Database error:", dbError);
      const error = dbError as { code?: string; message?: string };
      
      if (error.code === 'P1001') {
        return NextResponse.json(
          { 
            error: "Database connection failed",
            message: "Cannot reach database server. Your Neon database might be paused. Please check your Neon dashboard and ensure the database is active.",
            details: "Neon databases auto-pause after inactivity. Visit your Neon dashboard to wake it up."
          },
          { status: 503 } // Service Unavailable
        );
      }
      
      throw dbError; // Re-throw other errors
    }

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get the file from R2
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: decodedKey,
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      return NextResponse.json(
        { error: "File not found in storage" },
        { status: 404 }
      );
    }

    // Convert the stream to a buffer
    const chunks: Uint8Array[] = [];
    const stream = response.Body as Readable;
    
    for await (const chunk of stream) {
      chunks.push(chunk as Uint8Array);
    }
    
    const buffer = Buffer.concat(chunks);

    // Determine content type
    const contentType = file.fileType || response.ContentType || "application/octet-stream";

    // Validate PDF file if it's a PDF
    if (contentType === "application/pdf") {
      // Check PDF header
      const pdfHeader = buffer.slice(0, 4).toString();
      if (pdfHeader !== '%PDF') {
        console.error(`Invalid PDF header: "${pdfHeader}" (expected "%PDF")`);
        return NextResponse.json(
          { 
            error: "Invalid PDF file",
            message: "The file does not appear to be a valid PDF. It may be corrupted.",
          },
          { status: 400 }
        );
      }
    }

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        // CORS headers for PDF.js - must be specific for production
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Range",
        "Accept-Ranges": "bytes",
        // Additional headers for PDF.js compatibility
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}

