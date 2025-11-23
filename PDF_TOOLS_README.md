# PDF Analysis Tools - Documentation

## Overview

NotebookLama now includes three powerful **local-only** PDF analysis tools that work completely offline without any external API calls. These tools help you gain deeper insights into your documents, analyze content, and navigate PDFs more efficiently.

## 🎯 Features

### 1. Reading Insights
Get comprehensive statistics about your PDF documents including word count, character count, reading time estimates, and page analysis.

### 2. Keyword Finder
Discover the most important terms in your document with intelligent frequency analysis and automatic stopword filtering.

### 3. Auto Bookmarks Generator
Automatically generate a table of contents by extracting headings and key sections from each page of your PDF.

---

## 📊 Feature 1: Reading Insights

### What It Does
Analyzes your PDF and provides detailed reading statistics to help you understand the scope and complexity of your document.

### Metrics Provided

- **Total Word Count**: Complete count of all words in the document
- **Total Character Count**: Total number of characters (including spaces)
- **Total Pages**: Number of pages in the PDF
- **Estimated Reading Time**: Calculated at 200 words per minute
- **Average Words Per Page**: Helps understand document density

### How It Works

1. Extracts all text from the PDF using `pdf-parse`
2. Counts words and characters
3. Calculates reading time: `Math.ceil(totalWords / 200)`
4. Computes average words per page
5. Returns all metrics in a clean JSON format

### Usage

**API Endpoint:**
```
POST /api/pdf-tools/reading-insights
```

**Request Body:**
```json
{
  "fileId": "your-file-id"
}
```

**Response:**
```json
{
  "totalWordCount": 12500,
  "totalCharacterCount": 75000,
  "totalPages": 25,
  "estimatedReadingTime": 63,
  "averageWordsPerPage": 500
}
```

### UI Location
Navigate to: `/dashboard/[fileId]/reading-insights`

### Example Use Cases
- Estimate time needed to read a document
- Compare document lengths
- Understand document complexity
- Plan reading sessions

---

## 🔍 Feature 2: Keyword Finder

### What It Does
Identifies the most frequently used words in your document, excluding common stopwords, to help you understand key themes and topics.

### Features

- **Top 20 Most Frequent Words**: Automatically identifies the most important terms
- **Stopword Removal**: Filters out common English and Arabic stopwords
- **Frequency Analysis**: Shows exact count for each keyword
- **Visual Bar Chart**: Interactive visualization of word frequencies
- **Bilingual Support**: Handles both English and Arabic text

### How It Works

1. Extracts all text from the PDF
2. Splits text into individual words
3. Cleans words (lowercase, removes punctuation)
4. Filters out stopwords (English + Arabic)
5. Counts frequency of each remaining word
6. Returns top 20 words sorted by frequency (descending)

### Stopwords Filtered

**English Stopwords Include:**
- Articles: a, an, the
- Pronouns: he, she, it, they
- Prepositions: in, on, at, for, with
- Common verbs: is, are, was, were, have, has
- And 100+ more common words

**Arabic Stopwords Include:**
- Common Arabic articles and prepositions
- Pronouns and conjunctions
- Frequently used Arabic words

### Usage

**API Endpoint:**
```
POST /api/pdf-tools/keyword-finder
```

**Request Body:**
```json
{
  "fileId": "your-file-id",
  "topN": 20  // Optional, defaults to 20
}
```

**Response:**
```json
{
  "keywords": [
    {
      "word": "machine",
      "count": 45
    },
    {
      "word": "learning",
      "count": 38
    },
    {
      "word": "algorithm",
      "count": 32
    }
    // ... up to topN results
  ]
}
```

### UI Location
Navigate to: `/dashboard/[fileId]/keyword-finder`

### UI Features
- **Bar Chart Visualization**: Visual representation of word frequencies
- **List View**: Detailed list with ranking numbers
- **Interactive Design**: Hover effects and modern styling

### Example Use Cases
- Identify main topics in research papers
- Extract key concepts from documents
- Understand document focus areas
- Create topic summaries

---

## 📑 Feature 3: Auto Bookmarks Generator

### What It Does
Automatically creates a table of contents by analyzing each page of your PDF and extracting the first meaningful heading or text block.

### Features

- **Page-by-Page Analysis**: Scans every page individually
- **Smart Heading Detection**: Identifies meaningful text blocks
- **Automatic Title Extraction**: Extracts first significant line from each page
- **Clickable Navigation**: Generated bookmarks can navigate to specific pages
- **Fallback Handling**: Uses "Page X" if no meaningful heading found

### How It Works

1. Extracts text from each page separately
2. Splits page text into lines
3. Filters out empty or meaningless lines
4. Identifies first line with meaningful content (≥3 meaningful characters)
5. Cleans and truncates titles (max 100 characters)
6. Generates bookmark array with title and page number

### Algorithm Details

- **Meaningful Content Detection**: Checks for at least 3 non-numeric, non-punctuation characters
- **Text Cleaning**: Removes extra whitespace, limits length
- **Page Numbering**: Uses 1-based page numbering (Page 1, Page 2, etc.)

### Usage

**API Endpoint:**
```
POST /api/pdf-tools/bookmarks
```

**Request Body:**
```json
{
  "fileId": "your-file-id"
}
```

**Response:**
```json
{
  "bookmarks": [
    {
      "title": "Introduction to Machine Learning",
      "page": 1
    },
    {
      "title": "Chapter 1: Fundamentals",
      "page": 5
    },
    {
      "title": "Neural Networks Overview",
      "page": 12
    }
    // ... one bookmark per page
  ]
}
```

### UI Location
Navigate to: `/dashboard/[fileId]/bookmarks`

### UI Features
- **Table of Contents View**: Clean, organized list
- **Page Indicators**: Shows page number for each bookmark
- **Clickable Navigation**: Click to jump to specific pages (future enhancement)
- **Visual Hierarchy**: Clear distinction between bookmarks

### Example Use Cases
- Quickly navigate long documents
- Understand document structure
- Create study guides
- Generate document outlines

---

## 🔒 Privacy & Security

### 100% Local Processing

All three tools process PDFs **completely offline** on your server:

- ✅ **No External API Calls**: No data sent to OpenAI, Anthropic, or any other service
- ✅ **No Data Sharing**: Your documents never leave your server
- ✅ **Instant Processing**: No network latency, immediate results
- ✅ **Privacy First**: Perfect for sensitive documents

### Technical Implementation

- Uses `pdf-parse` library for PDF text extraction (Reading Insights, Keyword Finder, Bookmarks)
- All processing happens server-side in Node.js
- No client-side data transmission
- Secure file access with user authentication

---

## 🛠️ Technical Architecture

### Backend Structure

```
src/lib/pdf-tools.ts              # Core utility functions (text-based)
src/app/api/pdf-tools/
  ├── reading-insights/           # Reading insights API
  ├── keyword-finder/            # Keyword finder API
  └── bookmarks/                 # Bookmarks API
```

### Key Functions

**`getReadingInsights(fileId: string)`**
- Extracts PDF buffer
- Parses text and counts metrics
- Returns reading statistics

**`getKeywordFrequencies(fileId: string, topN: number)`**
- Extracts and cleans text
- Removes stopwords
- Counts frequencies
- Returns top N keywords

**`generateBookmarks(fileId: string)`**
- Extracts text per page
- Identifies meaningful headings
- Generates bookmark array

### Frontend Structure

```
src/app/dashboard/[fileId]/
  ├── reading-insights/page.tsx
  ├── keyword-finder/page.tsx
  └── bookmarks/page.tsx
```

### Sidebar Integration

The tools are accessible from the PDF sidebar under the "Tools" section:

```
📱 App Features
  - Chat Bot
  - Podcast
  - Flashcards
  - Quiz
  - Transcript

🔧 Tools (NEW)
  - Reading Insights
  - Keyword Finder
  - Bookmarks
```

---

## 📝 Usage Instructions

### For End Users

1. **Upload a PDF** to your NotebookLama dashboard
2. **Open the PDF** by clicking on it
3. **Navigate to Tools** section in the left sidebar
4. **Select a tool**:
   - Click "Reading Insights" for document statistics
   - Click "Keyword Finder" for word frequency analysis
   - Click "Bookmarks" for table of contents
5. **View Results** - All tools process instantly and display results

### For Developers

#### Accessing the APIs

```typescript
// Reading Insights
const response = await fetch('/api/pdf-tools/reading-insights', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fileId: 'your-file-id' })
});
const insights = await response.json();

// Keyword Finder
const response = await fetch('/api/pdf-tools/keyword-finder', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fileId: 'your-file-id', topN: 20 })
});
const { keywords } = await response.json();

// Bookmarks
const response = await fetch('/api/pdf-tools/bookmarks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fileId: 'your-file-id' })
});
const { bookmarks } = await response.json();


---

## 🎨 UI/UX Features

### Reading Insights Page
- **Card-based Layout**: Each metric in its own card
- **Color-coded Icons**: Different colors for different metrics
- **Large Numbers**: Easy-to-read statistics
- **Side-by-side Layout**: Document preview on the right

### Keyword Finder Page
- **Bar Chart Visualization**: Visual frequency representation
- **Dual View**: Both chart and list view
- **Ranking System**: Numbered list with counts
- **Responsive Design**: Works on all screen sizes

### Bookmarks Page
- **Table of Contents Style**: Clean, organized list
- **Page Numbers**: Clear page indicators
- **Hover Effects**: Interactive feedback
- **Clickable Items**: Ready for navigation (future feature)

---

## ⚙️ Configuration

### Reading Time Calculation

Reading time is calculated at **200 words per minute** by default. This can be adjusted in `src/lib/pdf-tools.ts`:

```typescript
const estimatedReadingTime = Math.ceil(totalWordCount / 200);
// Change 200 to your preferred reading speed
```

### Keyword Count Limit

Default is **top 20 keywords**. Can be customized via API:

```json
{
  "fileId": "your-file-id",
  "topN": 50  // Get top 50 keywords
}
```

### Stopwords Customization

Stopwords can be modified in `src/lib/pdf-tools.ts`:

```typescript
const ENGLISH_STOPWORDS = new Set([
  // Add or remove stopwords here
]);
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "File not found" error**
- Ensure the fileId is correct
- Verify the file belongs to the authenticated user
- Check file exists in database

**Issue: "File is not a PDF" error**
- Only PDF files are supported
- Verify file type before calling APIs

**Issue: Empty results**
- PDF might be image-based (scanned)
- Try with a text-based PDF
- Check PDF has extractable text

**Issue: Slow processing**
- Large PDFs may take longer
- Check server resources
- Consider optimizing PDF size

---

## 🔮 Future Enhancements

### Planned Features

1. **Enhanced Bookmark Navigation**
   - Click bookmarks to jump to pages in PDF viewer
   - Smooth scrolling to sections

2. **Export Functionality**
   - Export reading insights as PDF
   - Download keyword list as CSV
   - Export bookmarks as outline

3. **Advanced Keyword Analysis**
   - Keyword clustering
   - Topic modeling
   - Related keywords

4. **Reading Insights Enhancements**
   - Reading difficulty score
   - Language detection
   - Content categorization

5. **Bookmark Improvements**
   - Multi-level headings
   - Heading hierarchy detection
   - Custom bookmark titles

---

## 📚 Dependencies

### Required Packages

- `pdf-parse`: ^2.4.3 - PDF text extraction
- `pdfjs-dist`: ^3.4.120 - PDF.js for image extraction
- `jszip`: ^3.10.1 - ZIP file creation (client-side)
- `@types/jszip`: ^3.4.1 - TypeScript types for JSZip
- `@aws-sdk/client-s3`: ^3.907.0 - R2 storage access
- `next`: 15.4.1 - Next.js framework
- `react`: 18.2.0 - React UI library

### Internal Dependencies

- `@/lib/pdf-parse-loader` - PDF parsing utilities
- `@/lib/r2-config` - R2 storage configuration
- `@/db` - Database access
- `@/lib/auth` - Authentication

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Upload a PDF file
- [ ] Access Reading Insights - verify all metrics
- [ ] Access Keyword Finder - verify top keywords
- [ ] Access Bookmarks - verify page extraction
- [ ] Test with different PDF types
- [ ] Test with large PDFs
- [ ] Test with scanned PDFs
- [ ] Verify privacy (no external calls)

### Test Cases

1. **Small PDF (1-5 pages)**
   - Should process instantly
   - All metrics should be accurate

2. **Large PDF (50+ pages)**
   - Should handle gracefully
   - Processing time acceptable

3. **Scanned PDF**
   - May have limited text extraction
   - Bookmarks may use fallback titles

4. **Multi-language PDF**
   - Should handle English and Arabic
   - Keywords should work for both

---

## 📄 License

These features are part of NotebookLama and follow the same license terms.

---

## 🤝 Contributing

When contributing to these features:

1. Maintain 100% local processing (no external APIs)
2. Keep TypeScript types strict
3. Follow existing code style
4. Add error handling
5. Update this documentation

---

## 📞 Support

For issues or questions:
- Check this documentation first
- Review code comments in `src/lib/pdf-tools.ts`
- Check API route implementations
- Review UI components for examples

---

## 🎉 Summary

These three PDF analysis tools provide powerful, privacy-focused document analysis capabilities:

- **Reading Insights**: Understand document scope and complexity
- **Keyword Finder**: Discover key themes and topics
- **Auto Bookmarks**: Navigate documents efficiently

All tools work **100% offline** with **zero external API calls**, ensuring your documents remain private and secure while providing instant, valuable insights.

---

*Last Updated: January 2025*
*Version: 1.1.0*

### Changelog


**Version 1.0.0 (January 2025)**
- 🎉 Initial release
- 📊 Reading Insights feature
- 🔍 Keyword Finder feature
- 📑 Auto Bookmarks feature

