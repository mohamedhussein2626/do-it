import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2-config";
import { getServerSession } from "@/lib/auth-api";
import { db } from "@/db";
import { Readable } from "stream";

// Force Node.js runtime for file serving
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large file serving

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

    // Determine content type
    const contentType = file.fileType || response.ContentType || "application/octet-stream";
    const contentLength = response.ContentLength?.toString() || "unknown";

    // Stream the file directly instead of loading into memory
    // This is crucial for large files - prevents memory issues and timeouts
    const stream = response.Body as Readable;
    
    // For small files (< 10MB), we can validate PDF header
    // For large files, let the client (PDF.js) handle validation to avoid timeouts
    const shouldValidateHeader = contentType === "application/pdf" && 
                                  response.ContentLength && 
                                  response.ContentLength < 10 * 1024 * 1024; // 10MB
    
    // Create a readable stream for Next.js Response
    // This allows streaming large files without loading them into memory
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let firstChunkRead = false;
          
          for await (const chunk of stream) {
            const chunkData = new Uint8Array(chunk);
            
            // For small PDF files, validate header on first chunk only
            if (shouldValidateHeader && !firstChunkRead) {
              firstChunkRead = true;
              
              // Check PDF header (first 4 bytes should be '%PDF')
              if (chunkData.length >= 4) {
                const header = String.fromCharCode(...chunkData.slice(0, 4));
                if (header !== '%PDF') {
                  console.error(`Invalid PDF header: "${header}" (expected "%PDF")`);
                  // Don't error the stream - let PDF.js handle it
                  // This prevents breaking large file uploads
                  console.warn("PDF header validation failed, but continuing stream for client-side validation");
                }
              }
            }
            
            // Enqueue the chunk
            controller.enqueue(chunkData);
          }
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          try {
            controller.error(error);
          } catch (e) {
            // If controller is already closed, log the error
            console.error("Controller error:", e);
          }
        }
      },
      cancel() {
        // Clean up if stream is cancelled
        try {
          stream.destroy?.();
        } catch {
          // Ignore cleanup errors
        }
      },
    });

    // Return the file with appropriate headers
    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": contentLength,
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
    
    // Ensure we always return JSON, not HTML
    const errorMessage = error instanceof Error ? error.message : "Failed to serve file";
    const errorDetails = error instanceof Error ? error.stack : String(error);
    
    console.error("Error details:", errorDetails);
    
    return NextResponse.json(
      { 
        error: "Failed to serve file",
        message: errorMessage,
        // Only include details in development
        ...(process.env.NODE_ENV === 'development' && { details: errorDetails })
      },
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
  }
}

