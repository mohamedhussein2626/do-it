/**
 * PDF Tools - Local-only PDF analysis utilities
 * All features work 100% offline without external APIs
 */

// Import polyfills FIRST before any pdf-parse usage
import "./init-polyfills";
import { db } from "@/db";
import { getServerSession } from "@/lib/auth-api";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2-config";
import { Readable } from "stream";
import mammoth from "mammoth";
import { configurePdfjsWorker } from "./pdf-worker-utils";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

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
// Helper: Get File Buffer (supports all file types)
// ============================================================================

export async function getFileBuffer(fileId: string): Promise<{ buffer: Buffer; fileType: string | null }> {
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

  console.log(`📦 File buffer retrieved: ${buffer.length} bytes, type: ${file.fileType}`);

  return { buffer, fileType: file.fileType };
}

// Get text from database chunks (created during upload) - this is the PRIMARY method
async function getTextFromChunks(fileId: string): Promise<{ text: string; numPages: number }> {
  try {
    const chunks = await db.chunk.findMany({
      where: { fileId },
      orderBy: { createdAt: "asc" },
      take: 10000, // Get all chunks (increased limit)
    });

    if (chunks.length > 0) {
      const text = chunks.map((c) => c.text).join("\n\n");
      // Estimate pages from text (~500 words per page)
      const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
      const numPages = Math.max(1, Math.ceil(wordCount / 500));
      console.log(`✅ Retrieved ${chunks.length} chunks from database, ${text.length} characters, estimated ${numPages} pages`);
      return { text, numPages };
    }
    console.warn("⚠️ No chunks found in database");
    return { text: "", numPages: 1 };
  } catch (error) {
    console.error("❌ Error getting text from chunks:", error);
    return { text: "", numPages: 1 };
  }
}

// Legacy function name for backward compatibility
export async function getPdfBuffer(fileId: string): Promise<Buffer> {
  const { buffer } = await getFileBuffer(fileId);
  return buffer;
}

// ============================================================================
// Helper: Extract Text from Any File Type
// ============================================================================

export async function extractTextFromFile(buffer: Buffer, fileType: string | null): Promise<{
  text: string;
  numPages: number;
  pageTexts: string[]; // Text for each page
}> {
  console.log(`📄 Extracting text from file type: ${fileType || 'unknown'}`);
  
  try {
    // Handle PDF files
    if (fileType?.includes("pdf") || (!fileType && buffer.slice(0, 4).toString() === '%PDF')) {
      try {
        return await extractTextFromPdf(buffer);
      } catch (pdfError) {
        console.error("❌ PDF extraction failed, trying fallback:", pdfError);
        // Fallback to text extraction
        return await extractTextFromTextFile(buffer);
      }
    }
    
    // Handle Word documents (DOCX, DOC)
    if (fileType?.includes("wordprocessingml") || fileType?.includes("msword") || 
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileType === "application/msword") {
      try {
        return await extractTextFromWord(buffer);
      } catch (wordError) {
        console.error("❌ Word extraction failed, trying fallback:", wordError);
        // Fallback to text extraction
        return await extractTextFromTextFile(buffer);
      }
    }
    
    // Handle text files (TXT, MD)
    if (fileType?.includes("text/") || fileType === "text/plain" || fileType === "text/markdown") {
      return await extractTextFromTextFile(buffer);
    }
    
    // Default: try to extract as text
    console.log("⚠️ Unknown file type, attempting text extraction");
    return await extractTextFromTextFile(buffer);
  } catch (error) {
    console.error("❌ All extraction methods failed:", error);
    // Return minimal result to prevent complete failure
    return {
      text: "",
      numPages: 1,
      pageTexts: [""],
    };
  }
}

// Direct pdf-parse extraction (bypasses page-by-page processing)
async function extractTextDirectlyFromPdf(buffer: Buffer): Promise<{
  text: string;
  numPages: number;
}> {
  console.log("📄 Attempting direct pdf-parse extraction...");
  
  try {
    const { loadPdfParse } = await import("./pdf-parse-loader");
    const parseFn = await loadPdfParse();
    
    // Parse the PDF directly
    console.log("📦 Calling pdf-parse function...");
    const data = await parseFn(buffer);
    
    console.log("📊 PDF parse result structure:", {
      hasText: typeof data.text === 'string',
      textLength: typeof data.text === 'string' ? data.text.length : 0,
      hasDoc: !!data.doc,
      hasNumPages: typeof data.numPages === 'number',
      numPages: data.numPages || data.numpages,
      keys: Object.keys(data),
    });
    
    // Extract text from multiple possible locations
    let extractedText = "";
    let numPages = 1;
    
    // Try direct text property
    if (typeof data.text === 'string') {
      extractedText = data.text;
      console.log(`📝 data.text: ${extractedText.length} chars (first 100: "${extractedText.substring(0, 100)}")`);
    }
    
    // Try doc.text
    if (!extractedText && data.doc && typeof data.doc === 'object') {
      const doc = data.doc as Record<string, unknown>;
      console.log("📦 Checking doc object, keys:", Object.keys(doc));
      if (typeof doc.text === 'string') {
        extractedText = doc.text;
        console.log(`📝 doc.text: ${extractedText.length} chars (first 100: "${extractedText.substring(0, 100)}")`);
      }
    }
    
    // Get page count
    numPages = data.numPages || data.numpages || 1;
    console.log(`📄 Page count: ${numPages}`);
    
    // If we have text, estimate pages if needed
    if (extractedText && numPages === 1) {
      const wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length;
      numPages = Math.max(1, Math.ceil(wordCount / 500));
      console.log(`📄 Estimated ${numPages} pages from text (${wordCount} words)`);
    }
    
    if (!extractedText || extractedText.trim().length === 0) {
      console.warn("⚠️ No text extracted from PDF - PDF might be image-only (scanned)");
    }
    
    return { text: extractedText, numPages };
  } catch (error) {
    console.error("❌ Direct pdf-parse extraction failed:", error);
    console.error("❌ Error details:", error instanceof Error ? error.stack : String(error));
    return { text: "", numPages: 1 };
  }
}

// Fallback extraction using pdfjs-dist directly (page-by-page)
async function extractTextWithPdfjs(
  buffer: Buffer,
  options: { maxPages?: number } = {}
): Promise<{ text: string; numPages: number }> {
  const { maxPages = 200 } = options;
  console.log("📄 Attempting pdfjs-dist per-page extraction...");

  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.js");
    configurePdfjsWorker(pdfjs, "pdfjs-dist(text-fallback)");

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      isEvalSupported: false,
      useSystemFonts: false,
      useWorkerFetch: false,
      disableWorker: true,
    } as unknown as Record<string, unknown>);

    const doc = await loadingTask.promise;
    const totalPages = doc.numPages;
    const pagesToProcess = Math.min(totalPages, maxPages);
    console.log(`📄 pdfjs-dist fallback will process ${pagesToProcess}/${totalPages} pages`);

    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
      try {
        const page = await doc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => (isTextItem(item) ? item.str : ""))
          .join(" ");

        pageTexts.push(pageText.trim());
        if (pageNum % 10 === 0) {
          console.log(`📄 Processed ${pageNum} pages via pdfjs-dist fallback`);
        }
      } catch (pageError) {
        console.warn(`⚠️ Failed to extract page ${pageNum} via pdfjs-dist:`, pageError);
      }
    }

    const combined = pageTexts.join("\n\n").trim();
    return {
      text: combined,
      numPages: totalPages,
    };
  } catch (error) {
    console.error("❌ pdfjs-dist fallback extraction failed:", error);
    return { text: "", numPages: 1 };
  }
}

function isTextItem(item: unknown): item is TextItem {
  return typeof item === "object" && !!item && "str" in item && typeof (item as Record<string, unknown>).str === "string";
}

// Extract text from PDF - using the same method as upload (processHybridPdf)
// This is the PRIMARY method that works during upload
async function extractTextFromPdf(buffer: Buffer): Promise<{
  text: string;
  numPages: number;
  pageTexts: string[]; // Text for each page
}> {
  console.log("📄 Starting PDF text extraction using processHybridPdf (same as upload)...");
  console.log(`📦 Buffer size: ${buffer.length} bytes`);
  
  // Validate buffer
  if (!buffer || buffer.length === 0) {
    throw new Error("PDF buffer is empty");
  }
  
  // Check if it's a valid PDF
  const header = buffer.slice(0, 4).toString();
  if (header !== '%PDF') {
    console.warn(`⚠️ Warning: PDF header check failed, got "${header}". Attempting to parse anyway...`);
  } else {
    console.log(`✅ PDF header valid: ${header}`);
  }
  
  // Use direct pdf-parse FIRST to avoid worker errors
  console.log("🔍 Using direct pdf-parse extraction (avoids pdfjs-dist worker errors)...");
  let fullText = "";
  let numPages = 1;
  
  try {
    // Use pdf-parse directly to avoid pdfjs-dist worker initialization
    const result = await extractTextDirectlyFromPdf(buffer);
    fullText = result.text;
    numPages = result.numPages;
    
    console.log(`✅ Direct pdf-parse extracted: ${fullText.length} characters, ${numPages} pages`);
    
    // If still no text, try without OCR (might be faster for some PDFs)
    if (!fullText || fullText.trim().length === 0) {
      console.warn("⚠️ pdf-parse returned empty text - PDF might be image-only or corrupted");
    }
  } catch (error) {
    console.error("❌ Direct pdf-parse extraction failed:", error);
    console.error("❌ Error details:", error instanceof Error ? error.stack : String(error));
  }
  
  if (!fullText || fullText.trim().length === 0) {
    console.warn("⚠️ No text extracted via pdf-parse, trying pdfjs-dist fallback...");
    const pdfjsResult = await extractTextWithPdfjs(buffer, { maxPages: 250 });
    fullText = pdfjsResult.text;
    numPages = pdfjsResult.numPages;
  }

  if (!fullText || fullText.trim().length === 0) {
    console.warn("⚠️ No text extracted from PDF using any method");
    return {
      text: "",
      numPages: 1,
      pageTexts: [""],
    };
  }
  
  // Estimate page count from text if needed
  try {
    if (numPages <= 1 && fullText && fullText.trim().length > 0) {
      // Estimate from text
      const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;
      numPages = Math.max(1, Math.ceil(wordCount / 500));
      console.log(`📄 Estimated ${numPages} pages from text (${wordCount} words)`);
    }
  } catch (metaError) {
    console.warn("⚠️ Could not get page count, estimating from text...", metaError);
    // Estimate page count from text length (~500 words per page)
    const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;
    numPages = Math.max(1, Math.ceil(wordCount / 500));
    console.log(`📄 Estimated ${numPages} pages from text (${wordCount} words)`);
  }
  
  // Split text into pages for bookmarks
  const pageTexts: string[] = [];
  const words = fullText.split(/\s+/);
  const wordsPerPage = Math.ceil(words.length / numPages);
  
  for (let i = 0; i < numPages; i++) {
    const start = i * wordsPerPage;
    const end = Math.min((i + 1) * wordsPerPage, words.length);
    pageTexts.push(words.slice(start, end).join(" ") || "");
  }
  
  console.log(`✅ Final result: ${numPages} pages, ${fullText.length} characters, ${pageTexts.length} page texts`);
  
  return {
    text: fullText,
    numPages,
    pageTexts,
  };
}

// Extract text from Word documents (DOCX, DOC)
async function extractTextFromWord(buffer: Buffer): Promise<{
  text: string;
  numPages: number;
  pageTexts: string[];
}> {
  console.log("📝 Extracting text from Word document...");
  try {
    const result = await mammoth.extractRawText({ buffer });
    const fullText = result.value || "";
    
    // Estimate pages (average 500 words per page)
    const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;
    const estimatedPages = Math.max(1, Math.ceil(wordCount / 500));
    
    // Split text into pages (rough estimate)
    const words = fullText.split(/\s+/);
    const wordsPerPage = Math.ceil(words.length / estimatedPages);
    const pageTexts: string[] = [];
    
    for (let i = 0; i < estimatedPages; i++) {
      const start = i * wordsPerPage;
      const end = Math.min((i + 1) * wordsPerPage, words.length);
      pageTexts.push(words.slice(start, end).join(" ") || "");
    }
    
    console.log(`✅ Extracted ${fullText.length} characters, estimated ${estimatedPages} pages`);
    
    return {
      text: fullText,
      numPages: estimatedPages,
      pageTexts,
    };
  } catch (error) {
    console.error("❌ Error extracting text from Word document:", error);
    throw new Error(`Failed to extract text from Word document: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Extract text from text files (TXT, MD)
async function extractTextFromTextFile(buffer: Buffer): Promise<{
  text: string;
  numPages: number;
  pageTexts: string[];
}> {
  console.log("📝 Extracting text from text file...");
  try {
    const fullText = buffer.toString('utf-8');
    
    // Estimate pages (average 500 words per page)
    const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;
    const estimatedPages = Math.max(1, Math.ceil(wordCount / 500));
    
    // Split text into pages by lines (rough estimate)
    const lines = fullText.split('\n');
    const linesPerPage = Math.ceil(lines.length / estimatedPages);
    const pageTexts: string[] = [];
    
    for (let i = 0; i < estimatedPages; i++) {
      const start = i * linesPerPage;
      const end = Math.min((i + 1) * linesPerPage, lines.length);
      pageTexts.push(lines.slice(start, end).join('\n') || "");
    }
    
    console.log(`✅ Extracted ${fullText.length} characters, estimated ${estimatedPages} pages`);
    
    return {
      text: fullText,
      numPages: estimatedPages,
      pageTexts,
    };
  } catch (error) {
    console.error("❌ Error extracting text from text file:", error);
    throw new Error(`Failed to extract text from text file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================================================
// Feature 1: Reading Insights
// ============================================================================

export async function getReadingInsights(fileId: string): Promise<ReadingInsights> {
  console.log(`📊 Getting reading insights for file: ${fileId}`);
  try {
    // Try to get text from database chunks first (faster if available)
    console.log("📦 Getting text from database chunks (full uploaded file only)...");
    let { text, numPages } = await getTextFromChunks(fileId);
    
    // If no chunks found, extract directly from PDF file
    if (!text || text.trim().length === 0) {
      console.warn("⚠️ No chunks found in database - extracting directly from PDF file...");
      try {
        const { buffer, fileType } = await getFileBuffer(fileId);
        const extracted = await extractTextFromFile(buffer, fileType);
        text = extracted.text;
        numPages = extracted.numPages;
        console.log(`✅ Extracted text directly from file: ${text.length} chars, ${numPages} pages`);
      } catch (extractError) {
        console.error("❌ Error extracting text from file:", extractError);
        return {
          totalWordCount: 0,
          totalCharacterCount: 0,
          totalPages: 1,
          estimatedReadingTime: 0,
          averageWordsPerPage: 0,
        };
      }
    } else {
      console.log(`✅ Using text from chunks: ${text.length} chars, ${numPages} pages`);
    }
    
    return calculateReadingInsights(text, numPages);

  } catch (error) {
    console.error("❌ Error in getReadingInsights:", error);
    throw error;
  }
}

// Helper function to calculate reading insights from text
function calculateReadingInsights(text: string, numPages: number): ReadingInsights {
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
  const totalWordCount = words.length;
  const totalCharacterCount = text.length;
  const totalPages = numPages || 1; // Default to 1 if 0
  const estimatedReadingTime = Math.max(1, Math.ceil(totalWordCount / 200)); // 200 words/min, min 1
  const averageWordsPerPage =
    totalPages > 0 ? Math.round(totalWordCount / totalPages) : 0;

  console.log(`📊 Calculated metrics: ${totalWordCount} words, ${totalCharacterCount} chars, ${totalPages} pages`);

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
  console.log(`🔍 Getting keyword frequencies for file: ${fileId}, topN: ${topN}`);
  try {
    // Try to get text from database chunks first (faster if available)
    console.log("📦 Getting text from database chunks (full uploaded file only)...");
    let { text } = await getTextFromChunks(fileId);
    
    // If no chunks found, extract directly from PDF file
    if (!text || text.trim().length === 0) {
      console.warn("⚠️ No chunks found in database - extracting directly from PDF file...");
      try {
        const { buffer, fileType } = await getFileBuffer(fileId);
        const extracted = await extractTextFromFile(buffer, fileType);
        text = extracted.text;
        console.log(`✅ Extracted text directly from file: ${text.length} chars`);
      } catch (extractError) {
        console.error("❌ Error extracting text from file:", extractError);
        return [];
      }
    } else {
      console.log(`✅ Using text from chunks: ${text.length} chars`);
    }
    
    return extractKeywords(text, topN);
  } catch (error) {
    console.error("❌ Error in getKeywordFrequencies:", error);
    throw error;
  }
}

// Helper function to extract keywords from text
function extractKeywords(text: string, topN: number): KeywordFrequency[] {
  // Extract words
  const words = text
    .split(/\s+/)
    .map(cleanWord)
    .filter((w) => w && w.length > 0) // First filter: remove empty
    .filter((w) => w.length > 1 && !isStopword(w)); // Second filter: remove stopwords

  console.log(`📝 Found ${words.length} valid words after filtering`);

  if (words.length === 0) {
    console.warn("⚠️ No valid words found after filtering - text might be too short or only contains stopwords");
    // Try with less strict filtering
    const allWords = text
      .split(/\s+/)
      .map(cleanWord)
      .filter((w) => w && w.length > 0);
    console.log(`📝 Trying with less strict filtering: ${allWords.length} words`);
    
    if (allWords.length === 0) {
      return [];
    }
    
    // Count all words without stopword filtering
    const frequencyMap = new Map<string, number>();
    for (const word of allWords) {
      if (word && word.length > 1) {
        frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
      }
    }
    
    const frequencies: KeywordFrequency[] = Array.from(frequencyMap.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, topN);
    
    console.log(`✅ Found ${frequencies.length} keywords (with relaxed filtering)`);
    return frequencies;
  }

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

  console.log(`✅ Found ${frequencies.length} keywords`);
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
  console.log(`📑 Generating bookmarks for file: ${fileId}`);
  try {
    // Try to get text from database chunks first (faster if available)
    console.log("📦 Getting text from database chunks (full uploaded file only)...");
    let { text, numPages } = await getTextFromChunks(fileId);
    
    // If no chunks found, extract directly from PDF file
    if (!text || text.trim().length === 0) {
      console.warn("⚠️ No chunks found in database - extracting directly from PDF file...");
      try {
        const { buffer, fileType } = await getFileBuffer(fileId);
        const extracted = await extractTextFromFile(buffer, fileType);
        text = extracted.text;
        numPages = extracted.numPages;
        console.log(`✅ Extracted text directly from file: ${text.length} chars, ${numPages} pages`);
      } catch (extractError) {
        console.error("❌ Error extracting text from file:", extractError);
        // Return default bookmarks if extraction fails
        return [{
          title: `Page 1`,
          page: 1,
        }];
      }
    } else {
      console.log(`✅ Using text from chunks: ${text.length} chars, ${numPages} pages`);
    }
    
    // Create page texts from text
    const lines = text.split('\n');
    const linesPerPage = Math.ceil(lines.length / numPages);
    const pageTexts: string[] = [];
    for (let i = 0; i < numPages; i++) {
      const start = i * linesPerPage;
      const end = Math.min((i + 1) * linesPerPage, lines.length);
      pageTexts.push(lines.slice(start, end).join('\n') || "");
    }
    
    return generateBookmarksFromText(text, numPages, pageTexts);

  } catch (error) {
    console.error("❌ Error in generateBookmarks:", error);
    throw error;
  }
}

// Helper function to generate bookmarks from text
function generateBookmarksFromText(text: string, numPages: number, pageTexts: string[]): Bookmark[] {
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

    // If no meaningful line found, try to get first sentence or first 50 chars
    if (!title && pageText.trim().length > 0) {
      const firstSentence = pageText.trim().split(/[.!?]/)[0] || pageText.trim().substring(0, 50);
      if (firstSentence.trim().length >= 3) {
        title = firstSentence.trim();
      }
    }

    // If still no title, use a default title
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

  console.log(`✅ Generated ${bookmarks.length} bookmarks`);
  return bookmarks;
}

