/**
 * PDF Tools - Local-only PDF analysis utilities
 * All features work 100% offline without external APIs
 */

import { loadPdfParse } from "./pdf-parse-loader";
import { db } from "@/db";
import { getServerSession } from "@/lib/auth-api";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2-config";
import { Readable } from "stream";

// ============================================================================
// Types
// ============================================================================

export interface ReadingInsights {
  totalWordCount: number;
  totalCharacterCount: number;
  totalPages: number;
  estimatedReadingTime: number; // in minutes
  averageWordsPerPage: number;
}

export interface KeywordFrequency {
  word: string;
  count: number;
}

export interface Bookmark {
  title: string;
  page: number;
}

// ============================================================================
// Helper: Get PDF Buffer from File
// ============================================================================

export async function getPdfBuffer(fileId: string): Promise<Buffer> {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // Get file from database
  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId: session.user.id,
    },
    select: {
      key: true,
      fileType: true,
    },
  });

  if (!file) {
    throw new Error("File not found");
  }

  if (!file.fileType?.includes("pdf")) {
    throw new Error("File is not a PDF");
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
  const buffer = Buffer.concat(chunks);

  return buffer;
}

// ============================================================================
// Helper: Extract Text from PDF
// ============================================================================

async function extractTextFromPdf(buffer: Buffer): Promise<{
  text: string;
  numPages: number;
  pageTexts: string[]; // Text for each page
}> {
  const pdfParse = await loadPdfParse();
  const result = await pdfParse(buffer);

  const numPages = result.numpages || result.numPages || 0;
  let fullText = result.text || "";
  const pageTexts: string[] = [];

  // Try to get per-page text from pdf-parse if available
  // Check if result has a doc object with getText() method that returns pages
  if (result.doc && typeof result.doc === 'object') {
    const doc = result.doc as Record<string, unknown>;
    
    // Try to call getText() if it exists
    if (doc.getText && typeof doc.getText === 'function') {
      try {
        const textResult = await (doc.getText as () => Promise<{ 
          text?: string; 
          pages?: Array<{ text?: string }> 
        }>)();
        
        if (textResult && typeof textResult === 'object') {
          // Get full text
          if (typeof textResult.text === 'string') {
            fullText = textResult.text;
          }
          
          // Get per-page text if available
          if (textResult.pages && Array.isArray(textResult.pages)) {
            for (const page of textResult.pages) {
              if (page && typeof page === 'object' && typeof page.text === 'string') {
                pageTexts.push(page.text);
              } else {
                pageTexts.push("");
              }
            }
          }
        }
      } catch (error) {
        console.warn("Failed to extract per-page text via getText():", error);
      }
    }
  }

  // If we didn't get per-page text, fall back to distributing text evenly
  if (pageTexts.length === 0 && numPages > 0 && fullText) {
    // Divide text by pages (simple approach)
    const wordsPerPage = Math.ceil(fullText.split(/\s+/).length / numPages);
    const words = fullText.split(/\s+/);
    
    for (let i = 0; i < numPages; i++) {
      const start = i * wordsPerPage;
      const end = Math.min((i + 1) * wordsPerPage, words.length);
      pageTexts.push(words.slice(start, end).join(" ") || "");
    }
  } else if (pageTexts.length === 0) {
    // Fallback: use full text for all pages
    for (let i = 0; i < numPages; i++) {
      pageTexts.push(fullText);
    }
  }

  return {
    text: fullText,
    numPages,
    pageTexts,
  };
}

// ============================================================================
// Feature 1: Reading Insights
// ============================================================================

export async function getReadingInsights(fileId: string): Promise<ReadingInsights> {
  const buffer = await getPdfBuffer(fileId);
  const { text, numPages } = await extractTextFromPdf(buffer);

  // Calculate metrics
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
  const totalWordCount = words.length;
  const totalCharacterCount = text.length;
  const totalPages = numPages;
  const estimatedReadingTime = Math.ceil(totalWordCount / 200); // 200 words/min
  const averageWordsPerPage =
    totalPages > 0 ? Math.round(totalWordCount / totalPages) : 0;

  return {
    totalWordCount,
    totalCharacterCount,
    totalPages,
    estimatedReadingTime,
    averageWordsPerPage,
  };
}

// ============================================================================
// Feature 2: Keyword Finder (Frequency Analysis)
// ============================================================================

// English stopwords
const ENGLISH_STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
  "to", "was", "will", "with", "the", "this", "but", "they", "have",
  "had", "what", "said", "each", "which", "their", "time", "if",
  "up", "out", "many", "then", "them", "these", "so", "some", "her",
  "would", "make", "like", "into", "him", "has", "two", "more",
  "very", "after", "words", "long", "than", "first", "been", "call",
  "who", "oil", "sit", "now", "find", "down", "day", "did", "get",
  "come", "made", "may", "part", "i", "we", "you", "she", "do",
  "can", "could", "should", "would", "may", "might", "must", "shall",
  "am", "is", "are", "was", "were", "been", "being", "have", "has",
  "had", "having", "do", "does", "did", "doing", "will", "would",
  "shall", "should", "may", "might", "must", "can", "could",
]);

// Arabic stopwords
const ARABIC_STOPWORDS = new Set([
  "في", "من", "إلى", "على", "هذا", "هذه", "ذلك", "تلك", "التي",
  "الذي", "التي", "كان", "كانت", "يكون", "تكون", "كانوا", "يكونون",
  "له", "لها", "لهم", "لهن", "به", "بها", "بهم", "بها", "عنه",
  "عنها", "عنهم", "عنهن", "إليه", "إليها", "إليهم", "إليهن",
  "ال", "و", "أو", "لكن", "إذا", "إن", "أن", "ما", "لا", "لم",
  "لن", "ليس", "ليست", "لست", "لستم", "لستن", "لستما",
]);

function isStopword(word: string): boolean {
  const lowerWord = word.toLowerCase().trim();
  return (
    lowerWord.length < 2 ||
    ENGLISH_STOPWORDS.has(lowerWord) ||
    ARABIC_STOPWORDS.has(word.trim())
  );
}

function cleanWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]/g, "") // Keep English and Arabic characters
    .trim();
}

export async function getKeywordFrequencies(
  fileId: string,
  topN: number = 20
): Promise<KeywordFrequency[]> {
  const buffer = await getPdfBuffer(fileId);
  const { text } = await extractTextFromPdf(buffer);

  // Extract words
  const words = text
    .split(/\s+/)
    .map(cleanWord)
    .filter((w) => w.length > 1 && !isStopword(w));

  // Count frequencies
  const frequencyMap = new Map<string, number>();
  for (const word of words) {
    if (word) {
      frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
    }
  }

  // Convert to array and sort
  const frequencies: KeywordFrequency[] = Array.from(frequencyMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);

  return frequencies;
}

// ============================================================================
// Feature 3: Auto Bookmarks Generator
// ============================================================================

/**
 * Extract the first meaningful line from each page
 * This is a simplified approach - in a real implementation, you might
 * want to use pdfjs to get actual text blocks with positioning
 */
export async function generateBookmarks(fileId: string): Promise<Bookmark[]> {
  const buffer = await getPdfBuffer(fileId);
  const { numPages, pageTexts } = await extractTextFromPdf(buffer);

  const bookmarks: Bookmark[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const pageText = pageTexts[pageNum - 1] || "";
    
    // Extract first non-empty line
    const lines = pageText
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Find the first meaningful line (at least 3 characters, not just numbers/punctuation)
    let title = "";
    for (const line of lines) {
      // Check if line has meaningful content (not just numbers, spaces, or single chars)
      const meaningfulChars = line.replace(/[0-9\s\W]/g, "").length;
      if (meaningfulChars >= 3 && line.length >= 3) {
        title = line;
        break;
      }
    }

    // If no meaningful line found, use a default title
    if (!title) {
      title = `Page ${pageNum}`;
    } else {
      // Clean up the title (limit length, remove extra whitespace)
      title = title
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 100); // Limit to 100 characters
    }

    bookmarks.push({
      title,
      page: pageNum,
    });
  }

  return bookmarks;
}

