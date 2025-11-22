# NotebookLMApp - Comprehensive Codebase Analysis

**Generated Date:** October 24, 2025  
**Project Name:** NotebookLama  
**Version:** 0.1.0

---

## Table of Contents

1. [Framework, Libraries, and Tools](#1-framework-libraries-and-tools)
2. [Main Purpose and Functionality](#2-main-purpose-and-functionality)
3. [Architecture and Key Modules](#3-architecture-and-key-modules)
4. [Guest User and Free User Credit System](#4-guest-user-and-free-user-credit-system)
5. [Authentication System](#5-authentication-system)
6. [React Hook and useEffect Usage](#6-react-hook-and-useeffect-usage)
7. [useEffect Dependencies Analysis](#7-useeffect-dependencies-analysis)
8. [TypeScript ESLint Configuration](#8-typescript-eslint-configuration)
9. [Dashboard Components and Code](#9-dashboard-components-and-code)
10. [Popup Modals List](#10-popup-modals-list)
11. [Sub-Pages List](#11-sub-pages-list)
12. [Stripe Payment Integration](#12-stripe-payment-integration)
13. [Affiliate System (Refgrow)](#13-affiliate-system-refgrow)
14. [Coupon Integration](#14-coupon-integration)
15. [Email Configuration Review](#15-email-configuration-review)
16. [AI Model Information](#16-ai-model-information)

---

## 1. Framework, Libraries, and Tools

### Core Framework
- **Next.js 15.4.1** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5.9.3** - Type safety

### Database & ORM
- **Prisma 6.18.0** - Database ORM
- **PostgreSQL** - Database (via Prisma)

### Authentication
- **Better Auth 1.3.27** - Modern authentication library
- **@auth/prisma-adapter 2.11.0** - Prisma adapter for auth
- **bcryptjs 3.0.2** - Password hashing
- **jose 6.0.12** - JWT handling
- **jsonwebtoken 9.0.2** - JWT tokens
- **react-turnstile 1.1.4** - Cloudflare Turnstile CAPTCHA

### State Management & Data Fetching
- **tRPC 11.4.3** (@trpc/client, @trpc/server, @trpc/next, @trpc/react-query)
- **@tanstack/react-query 5.83.0** - Data fetching/caching

### Payment Processing
- **Stripe 18.3.0** - Payment processing

### AI & ML
- **OpenAI 6.3.0** - AI chat, essay generation
- **ElevenLabs (elevenlabs-node 2.0.3)** - Text-to-speech
- **@google-cloud/text-to-speech 6.2.0** - Google TTS
- **@huggingface/inference 4.5.3** - Hugging Face models
- **@xenova/transformers 2.17.2** - ML transformers
- **ai 2.2.13** - Vercel AI SDK

### File Processing
- **pdf-parse 2.4.3** - PDF text extraction
- **pdf-lib 1.17.1** - PDF manipulation
- **pdfjs-dist 3.4.120** - PDF rendering
- **react-pdf 7.3.3** - PDF viewer
- **mammoth 1.11.0** - DOCX processing

### Cloud Storage
- **@aws-sdk/client-s3 3.907.0** - S3-compatible storage (R2)
- **@aws-sdk/s3-request-presigner 3.907.0** - Pre-signed URLs

### Email
- **nodemailer 6.10.1** - Email sending
- **@types/nodemailer 7.0.3** - Type definitions

### UI Components
- **@radix-ui/*** - Various UI primitives (Dialog, Dropdown, Tabs, etc.)
- **lucide-react 0.525.0** - Icons
- **sonner 2.0.6** - Toast notifications
- **tailwindcss 4.1.11** - Styling
- **class-variance-authority 0.7.1** - CSS variants
- **clsx 2.1.1** - Class utilities

### Forms & Validation
- **react-hook-form 7.60.0** - Form management
- **@hookform/resolvers 5.1.1** - Validation resolvers
- **zod 3.25.6** - Schema validation

### Other Libraries
- **react-markdown 10.1.0** - Markdown rendering
- **date-fns 4.1.0** - Date utilities
- **react-dropzone 14.3.8** - File upload
- **simplebar-react 3.3.2** - Custom scrollbars
- **react-loading-skeleton 3.5.0** - Loading states

---

## 2. Main Purpose and Functionality

**NotebookLama** is an AI-powered document intelligence platform that provides:

### Core Features
1. **AI Document Chat** - Chat with uploaded PDFs using AI
2. **AI Podcast Generation** - Convert documents to audio podcasts with multiple voices
3. **AI Quiz Generation** - Create quizzes from document content
4. **AI Flashcards** - Generate flashcards for study
5. **Document Transcription** - Extract and format document text
6. **AI Essay Writer** - Generate essays from prompts
7. **AI Essay Grader** - Grade and provide feedback on essays
8. **Library System** - Organize documents into topics/notes

### User Types
- **Free Users** - Limited file uploads
- **Paid Users** - More/unlimited uploads, advanced features
- **Affiliates** - Earn commissions on referrals
- **Admins** - Manage users, plans, subscriptions

---

## 3. Architecture and Key Modules

### Architecture Overview
```
Next.js App Router (src/app/)
├── API Routes (api/)
│   ├── Auth endpoints
│   ├── File processing
│   ├── AI generation (chat, essay, quiz, etc.)
│   ├── Stripe webhooks
│   └── Admin endpoints
├── Pages
│   ├── Landing page
│   ├── Auth pages
│   ├── Dashboard
│   ├── Pricing
│   └── Admin panel
└── Components (src/components/)
    ├── UI primitives
    ├── Dashboard components
    ├── Modals
    └── Forms
```

### Key Modules

#### 1. **Authentication Module** (`src/lib/auth.ts`)
- Better Auth configuration
- Google OAuth
- Email/password auth
- Session management

#### 2. **Database Layer** (`src/db/index.ts`, `prisma/schema.prisma`)
- Prisma ORM
- PostgreSQL database
- Models: User, Session, File, Message, Plan, Payment, Subscription, Quiz, Flashcards, Podcast, etc.

#### 3. **tRPC Router** (`src/trpc/index.ts`)
- Type-safe API layer
- Endpoints: getUserFiles, deleteFile, getFileMessages, etc.

#### 4. **Payment Module**
- Stripe checkout (`src/app/api/stripe/checkout/route.ts`)
- Webhook handler (`src/app/api/stripe/webhook/route.ts`)
- Plan management

#### 5. **AI Generation Modules**
- Chat API (`src/app/api/message/route.ts`)
- Essay Writer (`src/app/api/generate-essay/route.ts`)
- Essay Grader (`src/app/api/grade-essay/route.ts`)
- Quiz Generation (`src/app/api/create-quiz/route.ts`)
- Flashcards (`src/app/api/create-flashcards/route.ts`)
- Podcast (`src/app/api/create-podcast/route.ts`)

#### 6. **File Processing**
- R2 upload (`src/app/api/upload-r2/route.ts`)
- PDF OCR hybrid (`src/lib/pdf-ocr-hybrid.ts`)
- Webpage extraction (`src/app/api/upload-webpage/route.ts`)

#### 7. **Email Module** (`src/lib/email.ts`)
- Nodemailer configuration
- Welcome emails
- Password reset emails
- Payment confirmation emails

#### 8. **Admin Module** (`src/app/(admin)/`)
- User management
- Plan management
- Subscription management
- Analytics
- Chargeback protection

---

## 4. Guest User and Free User Credit System

### Plan-Based System

The application uses a **plan-based credit system** defined in the `Plan` model:

```typescript
// Database Schema (prisma/schema.prisma)
model Plan {
  id                    Int
  name                  String
  numberOfFiles         Int  @default(0)
  numberOfEssayWriter   Int  @default(0)
  numberOfEssayGrader   Int  @default(0)
  // ... other fields
}
```

### How Credits Are Determined

1. **File Upload Credits** - `Plan.numberOfFiles`
   - `0` = Unlimited
   - `> 0` = Specific limit (e.g., 3 files for free plan)

2. **Essay Writer Credits** - `Plan.numberOfEssayWriter`
   - Tracks usage in `EssayUsage` model
   - Checked before generation

3. **Essay Grader Credits** - `Plan.numberOfEssayGrader`
   - Tracked similarly in `EssayUsage`

### Where Credits Are Set

1. **Admin Panel** - `src/app/(admin)/admin/plans/`
   - Create/edit plans with custom limits
   - Set `numberOfFiles`, `numberOfEssayWriter`, `numberOfEssayGrader`

2. **Database** - Plans stored in `Plan` table
   - Free plan typically has low limits (e.g., 3 files)
   - Paid plans have higher/unlimited limits

### Where Credits Are Checked

1. **Dashboard Component** (`src/components/Dashboard.tsx`)
```typescript
const getFileLimit = () => {
  if (isFreePlan) {
    const freePlan = plans.find(plan => 
      plan.name.toLowerCase().includes('free') && 
      plan.status === 'ACTIVE'
    );
    return freePlan?.numberOfFiles || 0;
  } else {
    return userPlan?.numberOfFiles || 0;
  }
};

const hasReachedFileLimit = fileLimit > 0 && files.length >= fileLimit;
```

2. **R2UploadButton** (`src/components/R2UploadButton.tsx`)
   - Checks file limit before allowing upload
   - Shows upgrade prompt if limit reached

3. **Essay Writer/Grader**
   - Fetches usage count from `EssayUsage` table
   - Compares against plan limits
   - Blocks usage if limit exceeded

### User Plan Assignment

- **New Users** - Default to free plan (`planName: "free"`, `subscriptionStatus: "free"`)
- **After Payment** - Updated via Stripe webhook to paid plan
- **Plan Info** - Stored in `User.planId`, `User.planName`, `User.subscriptionStatus`

### Guest Users
- **No guest access** - Authentication required for all features
- Must sign up to access dashboard and features

---

## 5. Authentication System

### Authentication Library
**Better Auth 1.3.27** - Modern, type-safe authentication

### Configuration (`src/lib/auth.ts`)
```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [nextCookies()],
});
```

### Authentication Methods

1. **Email/Password** - Standard registration
2. **Google OAuth** - Social login

### Login Flow

#### Sign In (`src/lib/actions/auth-actions.ts`)
1. User submits email/password + CAPTCHA
2. Verify Cloudflare Turnstile CAPTCHA
3. Call `auth.api.signInEmail()`
4. Extract IP address and user agent from headers
5. Update session with IP/user agent
6. Redirect to `/dashboard`

#### Sign Up
1. User submits email/password/name + CAPTCHA
2. Verify CAPTCHA
3. Call `auth.api.signUpEmail()`
4. Update session with IP/user agent
5. **Send welcome email** (`sendWelcomeEmail()`)
6. Redirect to `/dashboard`

#### Google OAuth
1. Click Google sign in button
2. Call `auth.api.signInSocial({ provider: "google" })`
3. Redirect to Google OAuth flow
4. Return to app with session

### Password Reset Flow

Located in `src/lib/actions/auth-actions.ts`:

```typescript
export const forgotPassword = async (email: string) => {
  // 1. Find user by email
  const user = await db.user.findUnique({ where: { email } });
  
  // 2. Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-12) + 
                       Math.random().toString(36).slice(-12).toUpperCase();
  
  // 3. Update user's password (NOT hashed - security issue!)
  await db.user.update({
    where: { id: user.id },
    data: { password: tempPassword },
  });
  
  // 4. Send email with new password
  await sendForgotPasswordEmail(email, user.name, tempPassword);
}
```

**Note:** Password is stored in plain text during reset - security vulnerability!

### Session Management

- **Storage** - HTTP-only cookies (via Better Auth)
- **Database** - `Session` table with user ID, IP, user agent
- **Middleware** - `src/middleware.ts` checks banned users on file uploads
- **Session Helpers**:
  - `getUserFromRequest()` - Get current user
  - `getSessionFromRequest()` - Get full session

### Protected Routes

- **Client-side** - `useSession()` hook from `@/lib/auth-client`
- **Server-side** - `auth.api.getSession()` with headers
- **tRPC** - `privateProcedure` checks authentication

---

## 6. React Hook and useEffect Usage

### useEffect Usage Summary

Total `useEffect` usage across components: **19+ instances**

### Key Components Using useEffect

#### 1. **Dashboard.tsx** (4 useEffect hooks)
```typescript
// Fetch plans and user data on mount
useEffect(() => {
  if (session && !sessionLoading) {
    fetchPlans();
    fetchUserData();
  }
}, [session, sessionLoading, fetchPlans, fetchUserData]);

// Show billing modal for free users
useEffect(() => {
  if (userData) {
    const isFreePlan = /* logic */;
    if (isFreePlan) {
      setShowBillingModal(true);
    }
  }
}, [userData]);

// Check for duplicate IP addresses
useEffect(() => {
  const checkForDuplicateIP = async () => {
    if (session && !sessionLoading) {
      const result = await checkDuplicateIP();
      // ... handle result
    }
  };
  checkForDuplicateIP();
}, [session, sessionLoading]);

// Redirect if not authenticated
useEffect(() => {
  if (!sessionLoading && !session) {
    router.push("/auth");
  }
}, [session, sessionLoading, router]);
```

#### 2. **PodcastPanel.tsx** (2 useEffect hooks)
```typescript
// Fetch podcast on mount
useEffect(() => {
  if (!initialPodcast) {
    fetchPodcast();
  } else if (initialPodcast.sections.length > 0) {
    // ... process sections
  }
}, []);

// Cleanup audio on unmount
useEffect(() => {
  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };
}, []);
```

#### 3. **AudioPlayer.tsx** (2 useEffect hooks)
```typescript
// Setup audio event listeners
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;
  
  audio.addEventListener('loadedmetadata', handleLoadedMetadata);
  audio.addEventListener('timeupdate', handleTimeUpdate);
  audio.addEventListener('ended', handleEnded);
  
  return () => {
    audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    // ... cleanup other listeners
  };
}, []);

// Handle play/pause
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;
  
  if (isPlaying) {
    audio.play();
  } else {
    audio.pause();
  }
}, [isPlaying]);
```

#### 4. **R2UploadButton.tsx** (2 useEffect hooks)
```typescript
// Redirect after file upload
useEffect(() => {
  if (fileData) {
    router.push(`/dashboard/${fileData.id}`);
  }
}, [fileData, router]);

// Fetch topics when dialog opens
useEffect(() => {
  if (!isOpen) return;
  (async () => {
    // Fetch topics...
  })();
}, [isOpen]);
```

#### 5. **EssayWriter/EssayGrader.tsx** (1 each)
```typescript
// Fetch usage on mount
useEffect(() => {
  fetchUsage();
}, []);
```

#### 6. **QuickNavTabs.tsx** (1 useEffect hook)
```typescript
// Check generation status periodically
useEffect(() => {
  const checkGenerationStatus = async () => {
    // ... check if quiz, flashcards, podcast exist
  };
  checkGenerationStatus();
}, [fileId]);
```

#### 7. **BillingModal.tsx** (1 useEffect hook)
```typescript
// Fetch plans and user profile when modal opens
useEffect(() => {
  if (isOpen) {
    fetchData();
  }
}, [isOpen]);
```

#### 8. **AffiliateProgram.tsx** (1 useEffect hook)
```typescript
useEffect(() => {
  fetchAffiliateData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

### Common useEffect Patterns

1. **Data Fetching on Mount**
   - Empty dependency array `[]`
   - Fetch initial data when component loads

2. **Session-Dependent Actions**
   - Dependencies: `[session, sessionLoading]`
   - Wait for session to load before fetching data

3. **Modal/Dialog Triggers**
   - Dependencies: `[isOpen]`
   - Fetch data when modal opens

4. **Cleanup Functions**
   - Return cleanup function
   - Remove event listeners, pause audio, etc.

5. **Redirect Logic**
   - Dependencies: `[session, router]`
   - Redirect based on authentication state

---

## 7. useEffect Dependencies Analysis

### Proper Dependency Usage

Most `useEffect` hooks follow React's rules:

#### Example: Dashboard.tsx
```typescript
useEffect(() => {
  if (session && !sessionLoading) {
    fetchPlans();
    fetchUserData();
  }
}, [session, sessionLoading, fetchPlans, fetchUserData]);
```
- **Dependencies**: All external values used inside effect
- **Callbacks wrapped**: `fetchPlans` and `fetchUserData` wrapped in `useCallback`

### Potential Issues

1. **AffiliateProgram.tsx**
```typescript
useEffect(() => {
  fetchAffiliateData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```
- ESLint rule disabled
- `fetchAffiliateData` not in dependencies
- Could cause stale closure issues

2. **Empty Arrays `[]`**
- Used when effect should only run on mount
- Acceptable for:
  - Initial data fetches
  - Setting up event listeners
  - One-time initialization

### useCallback Usage

Functions passed to `useEffect` are often wrapped in `useCallback`:

```typescript
const fetchUserData = useCallback(async () => {
  // ... fetch logic
}, [plans]); // Depends on plans

useEffect(() => {
  if (session && !sessionLoading) {
    fetchUserData();
  }
}, [session, sessionLoading, fetchUserData]);
```

### Common Dependency Patterns

1. **State variables** - `[state, setState]`
2. **Props** - `[prop1, prop2]`
3. **Refs** - Usually not needed (refs are stable)
4. **Callbacks** - Wrap in `useCallback` first
5. **Session** - `[session, sessionLoading]`

---

## 8. TypeScript ESLint Configuration

### ESLint Setup

File: `eslint.config.mjs`

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

### Configuration Analysis

1. **Format** - ESM flat config (modern ESLint format)
2. **Base Config** - `next/core-web-vitals` + `next/typescript`
3. **Next.js Rules** - Optimized for Next.js 15
4. **TypeScript Support** - Full TypeScript linting

### Included Rules

From `next/core-web-vitals`:
- React hooks rules
- Core web vitals performance checks
- Next.js specific optimizations

From `next/typescript`:
- TypeScript type checking
- Type safety rules
- TS-specific best practices

### TypeScript Configuration

File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Key TypeScript Settings

- **Strict mode enabled** - `"strict": true`
- **Path aliases** - `@/*` maps to `src/*`
- **JSX preserved** - For Next.js processing
- **Bundler resolution** - Modern module resolution

### Linting Commands

```json
// package.json
{
  "scripts": {
    "lint": "next lint"
  }
}
```

---

## 9. Dashboard Components and Code

### Main Dashboard Route

**Location**: `src/app/dashboard/page.tsx`

```typescript
import Dashboard from "@/components/Dashboard";

const page = () => {
  return <div><Dashboard /></div>;
};
```

### Dashboard Component

**Location**: `src/components/Dashboard.tsx` (729 lines)

### Dashboard Features

#### 1. **State Management**
```typescript
const [sidebarOpen, setSidebarOpen] = useState(true);
const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null);
const [showDuplicateIPModal, setShowDuplicateIPModal] = useState(false);
const [userData, setUserData] = useState<UserData | null>(null);
const [userPlan, setUserPlan] = useState<Plan | null>(null);
const [showBillingModal, setShowBillingModal] = useState(false);
const [plans, setPlans] = useState<Plan[]>([]);
```

#### 2. **Data Fetching**
- **Session** - `useSession()` from auth client
- **Files** - `trpc.getUserFiles.useQuery()`
- **User Profile** - `fetch("/api/user/profile")`
- **Plans** - `fetch("/api/admin/plans")`

#### 3. **File Management**
- Upload via `R2UploadButton`
- Display file grid
- Delete files (tRPC mutation)
- File limit enforcement

#### 4. **Quick Actions**
Array of action cards:
- Chat with PDF
- Listen to Podcast
- Quiz
- Flashcards
- Transcript
- Library

#### 5. **AI Writing Tools**
- AI Essay Writer
- AI Essay Grader

#### 6. **Banned User Handling**
Full-screen message when `userData.isBanned === true`:
- Shows ban reason
- Lists disabled features
- Prevents all actions

#### 7. **Plan Enforcement**
```typescript
const getFileLimit = () => {
  if (isFreePlan) {
    const freePlan = plans.find(plan => 
      plan.name.toLowerCase().includes('free') && 
      plan.status === 'ACTIVE'
    );
    return freePlan?.numberOfFiles || 0;
  } else {
    return userPlan?.numberOfFiles || 0;
  }
};

const hasReachedFileLimit = fileLimit > 0 && files.length >= fileLimit;
```

### Dashboard Sub-Components

Located in `src/components/dashboard/`:

1. **AudioPlayer.tsx** - Audio playback controls
2. **BannedUserMessage.tsx** - Banned user UI
3. **BrowserSpeechPlayer.tsx** - Browser TTS fallback
4. **EssayGrader.tsx** - Essay grading UI
5. **EssayWriter.tsx** - Essay generation UI
6. **FileGrid.tsx** - File display grid
7. **FlashcardsPanel.tsx** - Flashcard viewer
8. **FlashcardsPageWithSidebar.tsx** - Full flashcard page
9. **PDFPageWithSidebar.tsx** - PDF viewer with sidebar
10. **PodcastPanel.tsx** - Podcast player
11. **PodcastPageWithSidebar.tsx** - Full podcast page
12. **QuickActions.tsx** - Action button grid
13. **QuickNavTabs.tsx** - Navigation tabs
14. **QuizPanel.tsx** - Quiz interface
15. **QuizPageWithSidebar.tsx** - Full quiz page
16. **TranscriptPageWithSidebar.tsx** - Document transcript

### Dashboard Routes

#### File-Specific Routes (`src/app/dashboard/[fileId]/`)
- `/dashboard/[fileId]` - Main file view (PDF + chat)
- `/dashboard/[fileId]/chatbot` - Focused chat view
- `/dashboard/[fileId]/podcast` - Podcast page
- `/dashboard/[fileId]/quiz` - Quiz page
- `/dashboard/[fileId]/flashcards` - Flashcards page
- `/dashboard/[fileId]/transcript` - Transcript page

#### General Dashboard Routes
- `/dashboard/essay-writer` - Essay writer (no file needed)
- `/dashboard/essay-grader` - Essay grader (no file needed)
- `/dashboard/library` - Library/topics management
- `/dashboard/settings` - User settings

---

## 10. Popup Modals List

### Modal Components

#### 1. **BillingModal** (`src/components/BillingModal.tsx`)
**Appears When:**
- User reaches file upload limit
- Free user accesses dashboard (auto-shows)
- User clicks "Upgrade" button

**Features:**
- Displays available plans
- Shows plan features and pricing
- Plan selection UI
- "Subscribe Now" button → Stripe checkout

**Trigger Locations:**
- `Dashboard.tsx` - Auto-shows for free users
- `Dashboard.tsx` - File limit warning
- Various components - Upgrade buttons

#### 2. **DuplicateIPModal** (`src/components/DuplicateIPModal.tsx`)
**Appears When:**
- Multiple accounts detected from same IP address
- Checked on dashboard load via `checkDuplicateIP()`

**Features:**
- Security warning
- Lists duplicate accounts
- Shows IP address
- "Contact Support" button
- "I Understand" button

**Trigger Location:**
- `Dashboard.tsx` - useEffect on mount

#### 3. **Upload Dialog** (`src/components/R2UploadButton.tsx`)
**Appears When:**
- User clicks "Upload" button
- Shows file upload interface

**Features:**
- File dropzone
- Topic selection dropdown
- Webpage URL input (alternative to file upload)
- Upload progress
- Success/error messages

**Trigger Location:**
- `Dashboard.tsx` - Upload button
- Various dashboard pages

#### 4. **Radix UI Dialogs** (`src/components/ui/dialog.tsx`)
**Generic Dialog Component**
- Base for custom modals
- Used throughout application

#### 5. **Alert Dialogs** (`src/components/ui/alert-dialog.tsx`)
**Confirmation Dialogs**
- Delete confirmations
- Warning messages
- Destructive actions

### Modal Summary Table

| Modal | File | Trigger | Purpose |
|-------|------|---------|---------|
| Billing Modal | `BillingModal.tsx` | Upgrade button, Auto-show for free users | Plan selection & upgrade |
| Duplicate IP Modal | `DuplicateIPModal.tsx` | Dashboard mount (if duplicates found) | Security warning for duplicate accounts |
| Upload Dialog | `R2UploadButton.tsx` | Upload button click | File/webpage upload interface |
| Generic Dialog | `ui/dialog.tsx` | Various triggers | Base dialog component |
| Alert Dialog | `ui/alert-dialog.tsx` | Confirmation actions | Confirmations & warnings |

---

## 11. Sub-Pages List

### Marketing/Public Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | Landing page / Homepage |
| `/about` | `src/app/about/page.tsx` | About page |
| `/contact` | `src/app/contact/page.tsx` | Contact page |
| `/pricing` | `src/app/pricing/page.tsx` | Pricing plans page |
| `/affiliate` | `src/app/affiliate/page.tsx` | Affiliate program dashboard |
| `/ai-note-taker` | `src/app/ai-note-taker/page.tsx` | AI note taker landing page |
| `/notebooklm-alternative` | `src/app/notebooklm-alternative/page.tsx` | NotebookLM alternative page |
| `/turbolearn-alternative` | `src/app/turbolearn-alternative/page.tsx` | TurboLearn alternative page |

### Authentication Pages

| Route | File | Description |
|-------|------|-------------|
| `/auth` | `src/app/auth/page.tsx` | Login/Signup page |
| `/forgot-password` | `src/app/forgot-password/page.tsx` | Password reset request |
| `/reset-password` | `src/app/reset-password/page.tsx` | Password reset form |

### Dashboard Pages

| Route | File | Description |
|-------|------|-------------|
| `/dashboard` | `src/app/dashboard/page.tsx` | Main dashboard |
| `/dashboard/settings` | `src/app/dashboard/settings/page.tsx` | User settings |
| `/dashboard/library` | `src/app/dashboard/library/page.tsx` | Library/topics manager |
| `/dashboard/essay-writer` | `src/app/dashboard/essay-writer/page.tsx` | AI Essay Writer |
| `/dashboard/essay-grader` | `src/app/dashboard/essay-grader/page.tsx` | AI Essay Grader |

### File-Specific Pages

| Route Pattern | File | Description |
|--------------|------|-------------|
| `/dashboard/[fileId]` | `src/app/dashboard/[fileId]/page.tsx` | PDF viewer + chat |
| `/dashboard/[fileId]/chatbot` | `src/app/dashboard/[fileId]/chatbot/page.tsx` | Focused chat interface |
| `/dashboard/[fileId]/podcast` | `src/app/dashboard/[fileId]/podcast/page.tsx` | Podcast player |
| `/dashboard/[fileId]/quiz` | `src/app/dashboard/[fileId]/quiz/page.tsx` | Quiz interface |
| `/dashboard/[fileId]/flashcards` | `src/app/dashboard/[fileId]/flashcards/page.tsx` | Flashcards viewer |
| `/dashboard/[fileId]/transcript` | `src/app/dashboard/[fileId]/transcript/page.tsx` | Document transcript |

### Admin Pages

| Route | File | Description |
|-------|------|-------------|
| `/admin/login` | `src/app/(adminAuthenticated)/admin/login/page.tsx` | Admin login |
| `/admin/dashboard` | `src/app/(admin)/admin/dashboard/page.tsx` | Admin dashboard |
| `/admin/users` | `src/app/(admin)/admin/users/page.tsx` | User management |
| `/admin/subscriptions` | `src/app/(admin)/admin/subscriptions/page.tsx` | Subscription management |
| `/admin/plans/list` | `src/app/(admin)/admin/plans/list/page.tsx` | Plan list |
| `/admin/plans/add` | `src/app/(admin)/admin/plans/add/page.tsx` | Add new plan |
| `/admin/plans/[id]/edit` | `src/app/(admin)/admin/plans/[id]/edit/page.tsx` | Edit plan |
| `/admin/analytics` | `src/app/(admin)/admin/analytics/page.tsx` | Analytics dashboard |
| `/admin/chargeback-protection` | `src/app/(admin)/admin/chargeback-protection/page.tsx` | Chargeback protection |
| `/admin/settings` | `src/app/(admin)/admin/settings/page.tsx` | Admin settings |

### Test/Debug Pages

| Route | File | Description |
|-------|------|-------------|
| `/test-audio` | `src/app/test-audio/page.tsx` | Audio testing page |

### Total Sub-Pages: **33 pages**

---

## 12. Stripe Payment Integration

### Overview
Stripe integration for subscription management and payment processing.

### Configuration

**Environment Variables Required:**
```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
BASE_URL=https://yourapp.com
```

### Checkout Flow

#### File: `src/app/api/stripe/checkout/route.ts`

```typescript
export async function POST(req: Request) {
  // 1. Get authenticated user session
  const sessionData = await getSession();
  
  // 2. Get requested planId from request body
  const { planId, referralCode } = await req.json();
  
  // 3. Fetch plan from database
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  
  // 4. Create Stripe checkout session
  const stripeSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.BASE_URL}/dashboard`,
    cancel_url: `${process.env.BASE_URL}/`,
    metadata: {
      userId: sessionData.user.id,
      planId: String(plan.id),
      planName: plan.name,
      referralCode: referralCode || "",
    },
    customer_email: sessionData.user.email,
  });
  
  // 5. Return checkout URL
  return NextResponse.json({ success: true, url: stripeSession.url });
}
```

### Webhook Handler

#### File: `src/app/api/stripe/webhook/route.ts`

**Handles Events:**
1. `checkout.session.completed`
2. `customer.subscription.updated`
3. `customer.subscription.deleted`

#### Event: checkout.session.completed

```typescript
case "checkout.session.completed": {
  const session = event.data.object;
  const userId = session.metadata.userId;
  const planId = session.metadata.planId;
  const subscriptionId = session.subscription;

  // 1. Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionId,
      planId: parseInt(planId),
      planName: plan.name,
      subscriptionStatus: "active",
    },
  });

  // 2. Create/update subscription record
  await prisma.subscription.upsert({
    where: { stripeSubId: subscriptionId },
    create: {
      stripeSubId: subscriptionId,
      userId,
      planId: parseInt(planId),
      status: "active",
      interval: "monthly",
      startDate: new Date(),
    },
    update: { status: "active" },
  });

  // 3. Create payment record
  await prisma.payment.create({
    data: {
      amount: (session.amount_total || 0) / 100,
      status: session.payment_status ?? "paid",
      stripe_payment_id: session.payment_intent,
      price_id: priceId,
      user_email: session.customer_email,
      userId,
    },
  });

  // 4. Send payment confirmation email
  await sendPaymentConfirmationEmail(
    user.email,
    user.name,
    plan.name,
    (session.amount_total || 0) / 100,
    subscriptionId
  );

  break;
}
```

#### Event: customer.subscription.updated

```typescript
case "customer.subscription.updated": {
  const stripeSub = event.data.object;
  
  // Update user and subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionId: stripeSub.id,
      planId: plan.id,
      planName: plan.name,
      subscriptionStatus: stripeSub.status === "active" ? "active" : "canceled",
    },
  });
  
  await prisma.subscription.upsert({
    where: { stripeSubId: stripeSub.id },
    create: { /* ... */ },
    update: {
      status: stripeSub.status,
      endDate: stripeSub.ended_at ? new Date(stripeSub.ended_at * 1000) : null,
    },
  });
  
  break;
}
```

#### Event: customer.subscription.deleted

```typescript
case "customer.subscription.deleted": {
  const stripeSubDeleted = event.data.object;
  
  // Reset user to free plan
  await prisma.user.updateMany({
    where: { subscriptionId: stripeSubDeleted.id },
    data: {
      subscriptionId: null,
      planId: null,
      planName: "free",
      subscriptionStatus: "canceled",
    },
  });
  
  break;
}
```

### Database Models

#### User (Stripe fields)
```prisma
model User {
  stripeCustomerId       String?   @unique
  stripeSubscriptionId   String?   @unique
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?
  subscriptionId         String?   @unique
  subscriptionStatus     String    @default("free")
  planId                 Int?
  planName               String    @default("free")
}
```

#### Subscription
```prisma
model Subscription {
  id          Int      @id @default(autoincrement())
  stripeSubId String   @unique
  userId      String
  planId      Int
  status      String
  interval    String
  startDate   DateTime
  endDate     DateTime?
}
```

#### Payment
```prisma
model Payment {
  id                Int      @id @default(autoincrement())
  amount            Decimal
  status            String
  stripe_payment_id String?
  price_id          String?
  user_email        String
  userId            String
}
```

### Stripe Workflow

1. **User Clicks "Subscribe"** → Opens BillingModal
2. **Selects Plan** → Calls `/api/stripe/checkout`
3. **Redirects to Stripe** → User enters payment
4. **Payment Success** → Redirects to `/dashboard`
5. **Webhook Received** → Updates database + sends email
6. **User Access** → Can now use paid features

### Testing

Script: `scripts/test-stripe.js`

Stripe CLI for webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 13. Affiliate System (Refgrow)

### Overview
Affiliate program allowing users to earn commissions by referring new subscribers. Integrates with **Refgrow** (optional external service).

### Configuration

**Environment Variables:**
```bash
REFGROW_API_KEY=your_api_key
REFGROW_SECRET_KEY=your_secret_key
REFGROW_BASE_URL=https://api.refgrow.com
```

### Database Models

#### User (Affiliate Fields)
```prisma
model User {
  affiliateId            String?               @unique
  referralCode           String?               @unique
  referredBy             String?
  referredByUser         User?                 @relation("UserReferrals", fields: [referredBy], references: [id])
  referredUsers          User[]                @relation("UserReferrals")
  affiliateCommissions   AffiliateCommission[]
  referredCommissions    AffiliateCommission[] @relation("ReferredUserCommissions")
}
```

#### AffiliateCommission
```prisma
model AffiliateCommission {
  id             Int              @id @default(autoincrement())
  affiliateId    String
  referredUserId String
  subscriptionId Int?
  amount         Decimal          @db.Decimal(10, 2)
  percentage     Decimal          @db.Decimal(5, 2)
  status         CommissionStatus @default(PENDING)
  paidAt         DateTime?
  createdAt      DateTime         @default(now())
}

enum CommissionStatus {
  PENDING
  APPROVED
  PAID
  CANCELLED
}
```

#### Subscription (Affiliate Fields)
```prisma
model Subscription {
  affiliateCommission  Decimal?
  affiliateTrackingId  String?
  referralCode         String?
  affiliateCommissions AffiliateCommission[]
}
```

### Affiliate Registration

#### File: `src/app/api/affiliate/register/route.ts`

**POST - Register as Affiliate**
```typescript
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  // Generate unique IDs
  const affiliateId = `AFF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const referralCode = `REF_${session.user.name?.replace(/\s+/g, "").toUpperCase()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      affiliateId,
      referralCode,
    },
  });
  
  // Register with Refgrow (optional)
  const refgrowResult = await registerWithRefgrow({
    name: updatedUser.name,
    email: updatedUser.email,
    referralCode: updatedUser.referralCode,
    affiliateId: updatedUser.affiliateId,
  });
  
  return NextResponse.json({
    success: true,
    affiliate: { /* ... */ },
    refgrow: refgrowResult ? { registered: true } : { registered: false },
  });
}
```

**GET - Check Affiliate Status**
```typescript
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      affiliateId: true,
      referralCode: true,
      // ...
    },
  });
  
  if (!user?.affiliateId) {
    return NextResponse.json({ isAffiliate: false });
  }
  
  // Get statistics
  const stats = await prisma.affiliateCommission.aggregate({
    where: { affiliateId: session.user.id },
    _sum: { amount: true },
    _count: { id: true },
  });
  
  return NextResponse.json({
    isAffiliate: true,
    affiliate: { /* ... */ },
    stats: { /* ... */ },
  });
}
```

### Affiliate Dashboard

#### File: `src/app/affiliate/page.tsx`

**Features:**
- Registration form (if not affiliate)
- Stats cards:
  - Total Earnings
  - Total Referrals
  - Pending Commissions
  - Conversion Rate
  - Refgrow Connection Status
- Referral tools:
  - Referral link
  - Referral code
  - Copy buttons
- Tabs:
  - Overview
  - Commissions
  - Referrals
- FAQ section

### Affiliate Dashboard API

#### File: `src/app/api/affiliate/dashboard/route.ts`

**Returns:**
```typescript
{
  stats: {
    totalCommissions: number,
    totalCommissionsCount: number,
    pendingCommissions: number,
    paidCommissions: number,
    totalReferrals: number,
    conversionRate: number,
  },
  recentCommissions: Commission[],
  recentReferrals: Referral[],
  referralCode: string,
  referralLink: string,
  refgrow: {
    connected: boolean,
    stats?: {},
  }
}
```

### Commission Tracking

**Commission Rate:** 30% (defined in affiliate page description)

**When Commissions Are Created:**
- Not automatically created on subscription
- Needs to be implemented in Stripe webhook or custom logic

**Current Status:**
- Database models ready
- UI components ready
- **Missing:** Automatic commission creation on referral subscription

### Refgrow Integration

#### Function: `registerWithRefgrow()`

```typescript
async function registerWithRefgrow(affiliateData: AffiliateData) {
  if (!REFGROW_API_KEY || !REFGROW_SECRET_KEY) {
    console.log("Refgrow credentials not configured, skipping");
    return null;
  }

  const response = await fetch(`${REFGROW_BASE_URL}/affiliates/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${REFGROW_API_KEY}`,
      "X-Secret-Key": REFGROW_SECRET_KEY,
    },
    body: JSON.stringify(affiliateData),
  });

  if (response.ok) {
    return await response.json();
  }
  
  return null;
}
```

**Features:**
- Optional external integration
- Fails gracefully if credentials missing
- Syncs affiliate data to Refgrow platform

### Referral Flow

1. **User Joins Affiliate Program** → Gets `affiliateId` and `referralCode`
2. **Shares Referral Link** → `https://app.com/?ref=REF_CODE`
3. **New User Signs Up** → Need to capture `referralCode` during signup
4. **New User Subscribes** → Need to create `AffiliateCommission` record
5. **Commission Approved** → Status changed to `APPROVED`
6. **Payment Processed** → Status changed to `PAID`, `paidAt` set

**Note:** Steps 3-6 not fully implemented. Missing:
- Referral code capture during signup
- Automatic commission creation
- Commission approval workflow
- Payout processing

---

## 14. Coupon Integration

### Current Status: **Not Implemented**

No coupon or discount code system currently exists in the codebase.

### Evidence

1. **Database Schema** - No `Coupon` or `Discount` model
2. **Stripe Checkout** - No coupon parameter passed
3. **Search Results** - No files found containing "coupon", "discount", or "promo"

### Potential Implementation

If coupons were to be added, they would likely involve:

1. **Database Model**
```prisma
model Coupon {
  id             Int      @id @default(autoincrement())
  code           String   @unique
  discountType   String   // "percentage" or "fixed"
  discountValue  Decimal
  maxUses        Int?
  usedCount      Int      @default(0)
  expiresAt      DateTime?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
}
```

2. **Stripe Integration**
```typescript
// In checkout route
const stripeSession = await stripe.checkout.sessions.create({
  mode: "subscription",
  line_items: [{ price: plan.priceId, quantity: 1 }],
  discounts: couponId ? [{ coupon: couponId }] : [], // Add coupon
  // ... rest of config
});
```

3. **UI Components**
- Input field on BillingModal
- Validation endpoint
- Discount display

---

## 15. Email Configuration Review

### Email System Overview

**Email Library:** Nodemailer 6.10.1

**File:** `src/lib/email.ts` (288 lines)

### Configuration

```typescript
const getEmailConfig = () => {
  // Custom SMTP
  if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
    return {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };
  }

  // Service-based (Gmail, etc.)
  return {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };
};

const transporter = nodemailer.createTransport(getEmailConfig());
```

### Environment Variables Required

**Option 1: Email Service (Gmail, etc.)**
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
BASE_URL=https://yourapp.com
```

**Option 2: Custom SMTP**
```bash
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
BASE_URL=https://yourapp.com
```

### Email Templates

#### 1. Welcome Email
**Function:** `sendWelcomeEmail(email, name)`

**When Sent:**
- User signs up (email/password)
- Called in `src/lib/actions/auth-actions.ts` → `signUp()`

**Content:**
- Welcome message
- Feature list
- "Get Started" button
- Support links

#### 2. Password Reset Email
**Function:** `sendForgotPasswordEmail(email, name, password)`

**When Sent:**
- User requests password reset
- Called in `src/lib/actions/auth-actions.ts` → `forgotPassword()`

**Content:**
- Temporary password (plain text!)
- Login instructions
- Security warning

**Security Issue:** Sends password in plain text email!

#### 3. Payment Confirmation Email
**Function:** `sendPaymentConfirmationEmail(email, name, planName, amount, subscriptionId)`

**When Sent:**
- Successful payment
- Called in `src/app/api/stripe/webhook/route.ts` → `checkout.session.completed`

**Content:**
- Payment details
- Plan information
- Subscription ID
- Next steps
- Manage subscription link

### Implementation Status

| Email Type | Implemented | Triggered | Working |
|-----------|-------------|-----------|---------|
| Welcome Email | ✅ Yes | ✅ On signup | ⚠️ Depends on env vars |
| Password Reset | ✅ Yes | ✅ On forgot password | ⚠️ Security issue + env vars |
| Payment Confirmation | ✅ Yes | ✅ On payment success | ⚠️ Depends on env vars |

### When Emails Are Sent

#### 1. Welcome Email
**Trigger:** User signup
```typescript
// src/lib/actions/auth-actions.ts
export const signUp = async (email, password, name, captchaToken) => {
  // ... create account
  
  try {
    const { sendWelcomeEmail } = await import("@/lib/email");
    await sendWelcomeEmail(email, name);
  } catch (emailError) {
    console.error("Failed to send welcome email:", emailError);
    // Don't fail signup if email fails
  }
}
```

**Conditions:**
- Email/password signup only (not Google OAuth)
- Non-blocking (signup succeeds even if email fails)

#### 2. Password Reset Email
**Trigger:** Forgot password request
```typescript
// src/lib/actions/auth-actions.ts
export const forgotPassword = async (email: string) => {
  const user = await db.user.findUnique({ where: { email } });
  
  if (!user) {
    return { success: false, error: "No account found" };
  }

  // Generate temp password
  const tempPassword = Math.random().toString(36).slice(-12) + 
                       Math.random().toString(36).slice(-12).toUpperCase();
  
  // Update user password (NOT HASHED!)
  await db.user.update({
    where: { id: user.id },
    data: { password: tempPassword },
  });

  // Send email
  const { sendForgotPasswordEmail } = await import("@/lib/email");
  const emailResult = await sendForgotPasswordEmail(email, user.name, tempPassword);

  if (!emailResult.success) {
    return { success: false, error: "Failed to send password reset email" };
  }

  return { success: true };
}
```

**Conditions:**
- User exists in database
- Email sending succeeds
- **Critical Issue:** Password stored unhashed!

#### 3. Payment Confirmation Email
**Trigger:** Stripe webhook - checkout.session.completed
```typescript
// src/app/api/stripe/webhook/route.ts
case "checkout.session.completed": {
  // ... update database
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });
    
    if (user) {
      const { sendPaymentConfirmationEmail } = await import("@/lib/email");
      await sendPaymentConfirmationEmail(
        user.email,
        user.name,
        plan.name,
        (session.amount_total || 0) / 100,
        subscriptionId || undefined
      );
    }
  } catch (emailError) {
    console.error("Failed to send payment confirmation email:", emailError);
    // Don't fail webhook if email fails
  }
  
  break;
}
```

**Conditions:**
- Payment successful
- User found in database
- Non-blocking (webhook succeeds even if email fails)

### Email Testing

**Test Endpoint:** `POST /api/test-email`

```typescript
// src/app/api/test-email/route.ts
export async function POST(req: NextRequest) {
  const { action, email, name } = await req.json();

  switch (action) {
    case "test-connection":
      return await testEmailConnection();

    case "test-welcome":
      return await sendWelcomeEmail(email, name);

    default:
      return NextResponse.json({ error: "Invalid action" });
  }
}
```

**Test Email Connection:**
```typescript
export async function testEmailConnection() {
  try {
    await transporter.verify();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Password Reset Method Analysis

#### Current Implementation
1. User enters email on forgot password page
2. System generates random temporary password
3. **Password stored in database WITHOUT hashing**
4. Email sent with plain text password
5. User logs in with temporary password
6. User should change password (not enforced)

#### Security Issues

1. **Password Not Hashed**
```typescript
await db.user.update({
  where: { id: user.id },
  data: { password: tempPassword }, // Plain text!
});
```

2. **Password Sent in Email**
- Email can be intercepted
- Email stored in email provider
- No expiration on temporary password

#### Recommended Improvements

1. **Hash Password Before Storage**
```typescript
import bcrypt from 'bcryptjs';

const tempPassword = generateRandomPassword();
const hashedPassword = await bcrypt.hash(tempPassword, 10);

await db.user.update({
  where: { id: user.id },
  data: { password: hashedPassword },
});
```

2. **Use Password Reset Tokens**
```typescript
// Generate token
const resetToken = crypto.randomBytes(32).toString('hex');
const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

await db.user.update({
  where: { id: user.id },
  data: {
    resetToken,
    resetTokenExpiry,
  },
});

// Send email with reset link
const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}`;
await sendPasswordResetEmail(email, name, resetUrl);
```

3. **Better Auth Built-in Reset**
Better Auth likely has built-in password reset functionality that should be used instead.

### Email Integration Summary

#### What's Implemented
✅ Nodemailer transporter with SMTP/service config  
✅ Welcome email template and sending  
✅ Password reset email template and sending  
✅ Payment confirmation email template and sending  
✅ Email test endpoint  

#### What's Missing
❌ Email verification for new signups  
❌ Email change confirmation  
❌ Subscription renewal reminders  
❌ Account activity notifications  
❌ Essay/content generation notifications  

#### Configuration Status
⚠️ **Requires environment variables to be set**  
⚠️ **Will silently fail if not configured**  
⚠️ **No email verification required (disabled in auth config)**  

#### Security Concerns
🚨 **Password reset sends plain text password**  
🚨 **Password not hashed during reset**  
🚨 **No token-based reset flow**  

---

## 16. AI Model Information

### Analysis Model
**Model:** Claude Sonnet 4.5  
**Provider:** Anthropic  
**Training Data Cut-off:** April 2024

### Models Used in Codebase

1. **OpenAI GPT Models** - Chat, essay generation, grading
2. **ElevenLabs** - Text-to-speech for podcasts
3. **Google Cloud TTS** - Alternative TTS
4. **Hugging Face Models** - Via @huggingface/inference
5. **Transformers.js** - Browser-side ML models

---

## Summary

NotebookLama is a sophisticated AI-powered document intelligence platform built with modern technologies (Next.js 15, React 18, TypeScript, Prisma, Better Auth). The application provides comprehensive document analysis features including AI chat, podcast generation, quizzes, flashcards, and essay tools.

Key findings:
- **Plan-based credit system** for free/paid users
- **Better Auth** with email/password and Google OAuth
- **Extensive useEffect usage** (19+ hooks) with proper dependencies
- **Modern ESLint** configuration with TypeScript support
- **5 popup modals** for various interactions
- **33 sub-pages** across marketing, dashboard, admin areas
- **Stripe integration** with webhook handlers
- **Affiliate system** with Refgrow integration (partially implemented)
- **No coupon system** currently implemented
- **Email system** fully implemented but with security concerns in password reset

**Security Note:** Password reset implementation stores passwords in plain text and should be improved before production use.

---

**Analysis Completed:** October 24, 2025  
**AI Model:** Claude Sonnet 4.5 (Anthropic)  
**Training Data Cut-off:** April 2024

