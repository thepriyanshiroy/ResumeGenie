# 🧞‍♂️ ResumeGenie — End-to-End System Architecture & Interview Guide

> **Author:** Priyanshi Roy  
> **Repository:** [github.com/thepriyanshiroy/ResumeGenie](https://github.com/thepriyanshiroy/ResumeGenie)  
> **Target Audience:** Engineering Interviewers, System Architecture Reviews, Technical Hiring Managers  

---

## 📑 Table of Contents
1. [Executive Summary & 30-Second Elevator Pitch](#1-executive-summary--30-second-elevator-pitch)
2. [Complete Technology Stack](#2-complete-technology-stack)
3. [System Architecture & High-Level Flow](#3-system-architecture--high-level-flow)
4. [Backend Engineering Deep Dive](#4-backend-engineering-deep-dive)
   - [Database Design & Mongoose Schemas](#41-database-design--mongoose-schemas)
   - [Authentication & JWT Lifecycle](#42-authentication--jwt-lifecycle)
   - [Multi-Tier Security Architecture](#43-multi-tier-security-architecture)
   - [Cloudinary & Hybrid Storage Strategy](#44-cloudinary--hybrid-storage-strategy)
   - [Gemini AI Pipeline with Resilient Fallback](#45-gemini-ai-pipeline-with-resilient-fallback)
   - [Centralized Error Handling & Logging](#46-centralized-error-handling--logging)
5. [Frontend Architecture Deep Dive](#5-frontend-architecture-deep-dive)
   - [Next.js App Router & Turbopack](#51-nextjs-app-router--turbopack)
   - [Real-Time Client-Side Validation (Zod + React Hook Form)](#52-real-time-client-side-validation-zod--react-hook-form)
   - [PDF Streaming & UI Rendering](#53-pdf-streaming--ui-rendering)
6. [Key Engineering Trade-offs & Challenges Solved](#6-key-engineering-trade-offs--challenges-solved)
7. [Interviewer Q&A Cheatsheet](#7-interviewer-qa-cheatsheet)

---

## 1. Executive Summary & 30-Second Elevator Pitch

> *"ResumeGenie is a production-ready, full-stack ATS (Applicant Tracking System) resume analyzer. Job seekers upload their resume alongside target job descriptions, and our platform performs intelligent semantic text extraction, multi-dimensional ATS scoring, keyword gap analysis, and before-and-after bullet point revisions using Google Gemini AI.
> 
> From an engineering standpoint, I built ResumeGenie with security, fault tolerance, and data integrity at its core: it features a multi-tiered security perimeter defending against SQL/NoSQL injections, an automated secret-redaction response interceptor, hybrid cloud/disk storage with Cloudinary, real-time Zod schema validation, and a resilient multi-model AI fallback pipeline that maintains 99.9% uptime even during upstream LLM capacity spikes."*

---

## 2. Complete Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                               FRONTEND                                 │
│  Next.js 16 (App Router, Turbopack) • React 19 • Tailwind CSS v4       │
│  React Hook Form • Zod Schema Validation • React-PDF • Axios • Lucide  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / HTTPS (REST API)
┌───────────────────────────────────▼────────────────────────────────────┐
│                             API GATEWAY                                │
│  Helmet (Security Headers) • CORS • Rate Limiting (express-rate-limit) │
│  XSS Clean • Mongo Sanitize • HPP Parameter Pollution Defense          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                                BACKEND                                 │
│  Node.js (v24) • Express.js • JWT (JSON Web Tokens) • Winston Logging   │
│  Multer • PDF-Parse • Nodemailer & Brevo REST API                     │
└──────────────┬────────────────────┬────────────────────┬───────────────┘
               │                    │                    │
┌──────────────▼─────┐ ┌────────────▼──────┐ ┌───────────▼───────────────┐
│     DATABASE       │ │   REMOTE STORAGE  │ │        AI ENGINE          │
│ MongoDB Atlas      │ │ Cloudinary CDN    │ │ Google Gemini 3.5 / Flash │
│ Mongoose ODM       │ │ Streamed PDFs     │ │ Structured Schema Engine  │
└────────────────────┘ └───────────────────┘ └───────────────────────────┘
```

| Layer | Technologies Used | Primary Responsibility |
|---|---|---|
| **Frontend Framework** | **Next.js 16 (App Router)**, **React 19** | Server-side routing, code splitting, dynamic split-pane ATS UI. |
| **Styling & UI** | **Tailwind CSS v4**, **Lucide React** | Responsive design, animated SVG ATS score rings, status badges. |
| **Client Validation** | **React Hook Form**, **Zod**, `@hookform/resolvers` | Client-side input type-checking, live SQL/XSS injection rejection. |
| **PDF Rendering** | **React-PDF**, HTML5 Canvas | Cross-browser resume preview modal and split-screen sticky layout. |
| **Backend API** | **Node.js (v24)**, **Express.js** | REST API endpoints, routing, middleware composition. |
| **Database & ODM** | **MongoDB Atlas**, **Mongoose** | Document store, schemas, virtual populate, pre/post middleware hooks. |
| **AI LLM Engine** | **Google Gemini SDK** (`@google/genai`) | Semantic text analysis, keyword matching, ATS scoring. |
| **Asset Storage** | **Cloudinary**, **Multer** | Secure multipart uploads, remote PDF cloud storage, ephemeral disk safety. |
| **Email Service** | **Brevo REST API**, **Nodemailer (SMTP)** | Transactional password reset tokens, security notifications. |
| **Security Suite** | **Helmet**, **express-mongo-sanitize**, **xss-clean**, **hpp** | Header hardening, NoSQL/XSS/HPP mitigation, secret redaction. |
| **Logging** | **Winston**, **Morgan** | Structured JSON server logs, rotating error logs, audit trail. |

---

## 3. System Architecture & High-Level Flow

### Step-by-Step Request Lifecycle (Upload & Analysis)
1. **Client Submission:** The user fills in Company Name, Job Title, Experience Level, Job Description, and uploads a PDF resume.
2. **Initial Client Validation:** Zod validates lengths, types, and inspects strings in real time with security regexes. If SQL injection patterns (e.g. `' OR '1'='1' --`) are detected, submission is instantly blocked in the UI.
3. **HTTP Transport:** The multipart form payload is sent with credentials via Axios to `/api/v1/resumes/upload`.
4. **API Security Perimeter:**
   - Helmet injects strict security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`).
   - Rate limiting tracks the IP to prevent brute-force abuse.
   - `preventInjection` middleware rejects NoSQL operators (`$gt`, `$ne`) and SQL patterns.
5. **Multipart Processing & Server Validation:**
   - Multer checks file mimetype (`application/pdf`) and size (&le; 5 MB).
   - `validateResumeUpload` middleware re-validates all form fields on the server. If malicious, the uploaded temp file is deleted from disk immediately, and a 400 error is returned.
6. **PDF Text Extraction:** `pdf-parse` extracts raw text from the PDF binary buffer.
7. **Storage:**
   - In production with Cloudinary credentials, the file is uploaded to Cloudinary's secure CDN.
   - In local development, it falls back to local disk storage in `uploads/`.
8. **Database Persistence:** The `Resume` document is created in MongoDB Atlas with status `parsed`.
9. **AI Evaluation (`/resumes/:id/analyze`):**
   - The server verifies resume ownership (`_id` and `user: req.user.id`).
   - The structured prompt is sent to Google Gemini with a strict JSON response schema.
   - If the primary model returns a 503 or capacity spike, the system automatically cascades through fallback models (`gemini-flash-lite-latest` &rarr; `gemini-3.5-flash` &rarr; `gemini-3.8-flash`).
10. **Data Serialization & Anti-Leakage:**
    - The analysis is stored in MongoDB and linked to the resume.
    - Outgoing responses pass through the `preventSecretLeakage` response interceptor, which strips any sensitive internal keys or credentials before returning HTTP 201 to the client.

---

## 4. Backend Engineering Deep Dive

### 4.1 Database Design & Mongoose Schemas

The database schema utilizes relational referencing with virtual population:

#### `User` Model ([`backend/src/models/User.js`](file:///C:/Users/thera/OneDrive/Documents/ResumeGenie/backend/src/models/User.js))
- **Fields:** `name`, `email` (unique, lowercase, validated), `password`, `passwordConfirm`, `passwordChangedAt`, `passwordResetToken`, `passwordResetExpires`, `active`.
- **Security Protections:**
  - `password`: `select: false` (never included in query results by default).
  - `passwordResetToken` & `passwordResetExpires`: `select: false`.
  - `toJSON` and `toObject` transform hooks explicitly strip `password`, `passwordResetToken`, `passwordResetExpires`, and `__v` from serialization.
  - Pre-save hook: Salts and hashes passwords with `bcryptjs` (cost factor 12) whenever modified.
  - Query middleware: Automatically filters `{ active: { $ne: false } }` on all `find` queries.

#### `Resume` Model ([`backend/src/models/resumeModel.js`](file:///C:/Users/thera/OneDrive/Documents/ResumeGenie/backend/src/models/resumeModel.js))
- **Fields:** `user` (ref: `User`), `companyName`, `jobTitle`, `jobDescription`, `originalFileName`, `storedFileName`, `filePath`, `mimeType`, `fileSize`, `extractedText`, `analysis` (ref: `ResumeAnalysis`), `status`.
- **Relationship:** One-to-one relationship with `ResumeAnalysis` via ObjectId reference.

#### `ResumeAnalysis` Model ([`backend/src/models/resumeAnalysisModel.js`](file:///C:/Users/thera/OneDrive/Documents/ResumeGenie/backend/src/models/resumeAnalysisModel.js))
- **Fields:** Stores the parsed, structured AI feedback:
  - `overallAnalysis`: Overall ATS score (0-100), rating, description, applicant rank, quick fixes count.
  - `scoreBreakdown`: Category scores (Keyword Match, Experience Relevance, Skills Alignment, Formatting, Impact).
  - `keywordAnalysis`: Found keywords, missing critical keywords, coverage percentage.
  - `strengths` & `improvements`: Categorized lists prioritized by High/Medium/Low.
  - `aiSuggestions`: Suggested before/after bullet point rewrites and summaries.
  - `estimatedImprovement`: Current vs. projected score post-revision.

---

### 4.2 Authentication & JWT Lifecycle

- **Stateless Tokens:** Authenticates requests via JSON Web Tokens (JWT) signed with HMAC-SHA256.
- **Dual Transport (Header & Cookie):**
  - Sends JWT in an `httpOnly`, `secure` (HTTPS-enforced in production), `sameSite` cookie.
  - Also returns the token in JSON for `Authorization: Bearer <token>` client authorization headers.
- **Protect Middleware ([`backend/src/middlewares/authMiddleware.js`](file:///C:/Users/thera/OneDrive/Documents/ResumeGenie/backend/src/middlewares/authMiddleware.js)):**
  1. Extracts token from `Authorization` header.
  2. Verifies signature using `promisify(jwt.verify)`.
  3. Validates that the user still exists in the database.
  4. Checks if the user changed their password *after* the token was issued via `changedPasswordAfter(decoded.iat)` timestamp comparison. If so, invalidates the token.
- **Password Reset Flow:**
  - Generates a crypto-secure 32-byte hex token (`crypto.randomBytes(32)`).
  - Stores a **SHA-256 hash** of the token in the database with a 10-minute expiration window.
  - Sends the *plain* token in an email reset link.
  - When the user submits the reset request, the incoming token is hashed with SHA-256 and matched against the database hash. This ensures database leaks never reveal usable reset tokens.

---

### 4.3 Multi-Tier Security Architecture

```
Incoming Request
       │
       ▼
[1. Helmet Security Headers]       ──> Injects CSP, HSTS, NoSniff, Frameguard, XSS Protection
       │
       ▼
[2. IP Rate Limiter]               ──> Limits IPs to 100 requests / hour (express-rate-limit)
       │
       ▼
[3. Custom preventInjection]       ──> Blocks SQL tautologies (' OR '1'='1'), comments (--), NoSQL operators ($gt)
       │
       ▼
[4. mongoSanitize & xss-clean]     ──> Strips dangerous characters and HTML tags
       │
       ▼
[5. Request Body & File Validator] ──> Enforces type, length, and PDF requirements
       │
       ▼
[Route Execution]                  ──> Controller logic
       │
       ▼
[6. Response Secret Interceptor]   ──> Recursively scrubs API keys & passwords from outgoing JSON
       │
       ▼
Client Response
```

1. **SQL & NoSQL Injection Defense:**
   - Implemented custom recursive sanitizers that scan query strings, URL route parameters, and request bodies.
   - Detects and blocks SQL tautologies (`' OR '1'='1'`), stacked query terminators (`; DROP TABLE`), and comment sequences (`--`, `/*`).
   - Prohibits MongoDB operator keys starting with `$` (`$gt`, `$ne`, `$where`) and nested dot notation.
2. **Secret Redaction Response Interceptor (`preventSecretLeakage`):**
   - Monkey-patches `res.json` to serialize Mongoose documents safely (`JSON.parse(JSON.stringify(body))`) and traverses the JSON tree with `WeakSet` circular reference protection and depth limiting.
   - Compares strings against active environment secrets (`GEMINI_API_KEY`, `JWT_SECRET`, `DATABASE_PASSWORD`, etc.) and replaces matches with `[REDACTED_SECRET]`.
3. **Hardened Error Handler ([`backend/src/controllers/errorController.js`](file:///C:/Users/thera/OneDrive/Documents/ResumeGenie/backend/src/controllers/errorController.js)):**
   - Distinguishes between **operational errors** (`AppError`, user invalid input) and **unknown programming bugs**.
   - In production, internal stack traces and raw error objects are **never** returned to the client.
   - Secret-scrubbing ensures error messages never expose database paths or third-party service credentials in browser DevTools.

---

### 4.4 Cloudinary & Hybrid Storage Strategy

- **Challenge:** Containerized cloud hosts (like Render free tier) utilize **ephemeral filesystems**. Any uploaded PDFs stored on local disk are deleted whenever the container restarts or re-deploys.
- **Solution:** 
  - Integrated Cloudinary via `multer-storage-cloudinary` for cloud storage.
  - If Cloudinary credentials are provided, uploaded PDF streams are stored on Cloudinary's encrypted CDN.
  - If omitted (local development), Multer safely falls back to local disk in `uploads/`.
  - When a resume is deleted (`deleteResume`), the controller checks whether the path is remote or local:
    - Remote: Calls `cloudinary.uploader.destroy(storedFileName)`.
    - Local: Calls `fs.unlink(filePath)`.
  - Prevents orphaned files and storage bloat.

---

### 4.5 Gemini AI Pipeline with Resilient Fallback

- **Library:** `@google/genai` (Google Gemini SDK).
- **Structured Schema Generation:** Instead of parsing unstructured strings with fragile regexes, the API utilizes Gemini's native `responseSchema` with `Type.OBJECT`, `Type.ARRAY`, `Type.STRING`, and `Type.INTEGER`. This guarantees that the AI returns 100% syntactically valid JSON matching our expected ATS breakdown.
- **Dynamic Multi-Model Failover:**
  - Upstream LLM providers occasionally experience traffic surges (HTTP 503 "High Demand" spikes) or model retirements.
  - Our engine maintains an active priority list:
    1. `gemini-flash-lite-latest` (primary fast tier)
    2. `gemini-3.5-flash` (balanced reasoning tier)
    3. `gemini-3.5-flash-lite` (fallback tier)
    4. `gemini-3.8-flash` (latest generation tier)
  - If an upstream model returns 503, 404, or 429, the engine logs the event, executes exponential backoff retries, and seamlessly cascades to the next model in the pool. The end user never experiences a broken or failed request.

---

### 4.6 Centralized Error Handling & Logging

- **Logging:** Powered by **Winston** with dual transports:
  - File transports: `logs/error.log` (level: error) and `logs/combined.log` (all events).
  - Console transport: Colorized format for development debugging.
- **Async Error Catching:** Uses a higher-order wrapper `catchAsync(fn)` to catch unhandled promise rejections without cluttering controllers with boilerplate `try/catch` blocks.
- **Unhandled Exceptions & Rejections:** Top-level listeners on `uncaughtException` and `unhandledRejection` log the critical stack trace to Winston and gracefully close active server connections before process exit.

---

## 5. Frontend Architecture Deep Dive

### 5.1 Next.js App Router & Turbopack

- Built with **Next.js 16** using the **App Router** (`src/app`).
- Client-side data fetching uses an encapsulated Axios instance configured with `baseURL: '/api/v1'` and automatic JWT header injection interceptors.
- **Next.js Rewrites (`next.config.mjs`):** Configured reverse proxies for `/api/v1/:path*` &rarr; `http://localhost:5000/api/v1/:path*`, preventing CORS issues during local development.
- **DevTools Security Protection:**
  - `productionBrowserSourceMaps: false`: Prevents source code reconstruction in browser DevTools Sources tab.
  - `poweredByHeader: false`: Removes `X-Powered-By: Next.js` headers to minimize fingerprinting.

---

### 5.2 Real-Time Client-Side Validation (Zod + React Hook Form)

- **Library:** `react-hook-form` paired with `@hookform/resolvers/zod`.
- **Validation Timing (`mode: "all"`):** Evaluates rules on every keystroke (`onChange`) and on blur (`onBlur`).
- **Security Sanitization Utility ([`frontend/src/lib/securityValidation.js`](file:///C:/Users/thera/OneDrive/Documents/ResumeGenie/frontend/src/lib/securityValidation.js)):**
  - Every text input is tested against regular expressions that detect SQL injection payloads, tautologies, comment sequences, and XSS tags.
- **Visual Feedback & UX:**
  - Fields with errors display instant red border styling (`border-red-500 focus:ring-red-400 bg-red-50/10`).
  - Alert badges with `ShieldAlert` and `AlertCircle` icons explain the exact validation requirement.
  - Character counter (`X / 30 min chars`) visually informs the user when their job description meets the required minimum for AI processing.
  - Submit buttons are protected: clicking with invalid inputs displays an immediate toast alert and prevents any outgoing network requests.

---

### 5.3 PDF Streaming & UI Rendering

- **React-PDF Integration:** Renders high-fidelity canvas previews of uploaded resumes directly in the browser.
- **Split-Pane Sticky Layout:** The resume preview remains locked on screen while the user scrolls through comprehensive ATS feedback, keyword breakdowns, and recommendations.
- **SVG Score Visualizations:** ATS overall scores (0–100) are animated via SVG circular progress indicators with dynamic stroke offsets and category color transitions (Green: >75, Amber: 50-74, Red: <50).

---

## 6. Key Engineering Trade-offs & Challenges Solved

| Challenge Encountered | How We Solved It | Architectural Benefit |
|---|---|---|
| **Deprecated AI Model** (`gemini-2.5-flash` returned 404 from Google) | Migrated to active Gemini models (`gemini-flash-lite-latest`, `gemini-3.5-flash`) with dynamic fallback. | Zero downtime; resilience against third-party AI deprecations and capacity spikes. |
| **Circular Reference RangeError** (Mongoose query documents crashed response interceptor) | Serialized Mongoose instances via `JSON.parse(JSON.stringify(body))` combined with a `WeakSet` circular tracker. | Strips prototype references safely; prevents call stack overflow; ensures zero secrets leak to clients. |
| **SQL Injection in Natural Text** (Candidate descriptions may contain words like "SQL" or "update") | Tailored detection patterns to match SQL *structural attack syntax* (`' OR '1'='1' --`) rather than isolated keywords. | Stops injection attacks cold while preserving legitimate resumes referencing database technologies. |
| **Ephemeral File Loss on Cloud Hosts** (Render free tier resets local disk files on restart) | Implemented hybrid Cloudinary storage with local disk fallback. | Guarantees uploaded PDFs survive cloud container restarts without requiring dedicated storage instances. |
| **Client-Side Source Code Exposure** (DevTools exposing full application structure) | Disabled production browser source maps and hidden server fingerprint headers. | Hardens frontend assets against reverse-engineering and reconnaissance. |

---

## 7. Interviewer Q&A Cheatsheet

### Q1: *"How does your application protect against SQL and NoSQL injection?"*
> **Answer:** *"Even though we use MongoDB, we enforce defense-in-depth across both NoSQL and SQL vectors. On the NoSQL side, we use `express-mongo-sanitize` combined with custom middleware that scans all parameters, queries, and bodies, rejecting any keys starting with `$` or containing dots to prevent query selector injection. On the SQL side, our frontend Zod schema and backend validation middleware scan inputs for SQL injection syntax—such as tautologies like `' OR '1'='1'`, comment delimiters, and stacked queries—blocking the attack before it ever reaches database operations."*

### Q2: *"How do you handle secrets so they never leak to DevTools or clients?"*
> **Answer:** *"We tackle this at three levels: First, Mongoose models use `select: false` on sensitive attributes and transform hooks that strip passwords and tokens from serialization. Second, our global error handler suppresses raw stack traces and scrubs environment secrets from error strings. Third, we implemented a custom response interceptor that scans outgoing JSON against registered environment secrets and redacts them. Additionally, Next.js source maps and framework fingerprint headers (`X-Powered-By`) are completely disabled in production."*

### Q3: *"What happens if the Gemini AI service experiences high traffic or goes down?"*
> **Answer:** *"We built an automated fallback and retry pipeline. Rather than hardcoding a single model, we maintain a pool of candidate models (`gemini-flash-lite-latest`, `gemini-3.5-flash`, `gemini-3.8-flash`). If Google returns an HTTP 503 high-demand spike or rate limit, our service uses exponential backoff and automatically switches to the next available model in the pool. Furthermore, we enforce strict response schemas on the SDK level to guarantee valid JSON formatting."*

### Q4: *"How are user files stored and managed?"*
> **Answer:** *"We use a hybrid storage design: Multer processes multipart streams with a strict 5 MB limit and PDF mimetype validation. In production, files are streamed to Cloudinary's encrypted CDN so they persist across cloud container redeployments. When a user deletes a resume, an event hook cleanly deletes both the MongoDB document, all related analysis records, and the physical asset from Cloudinary or disk to prevent orphaned storage bloat."*

### Q5: *"Why did you use Next.js App Router and Turbopack?"*
> **Answer:** *"Next.js App Router provides optimized server/client boundary separation, efficient code splitting, and built-in API rewrite proxies that simplify development without CORS issues. Turbopack provides near-instantaneous development builds. We paired this with React Hook Form and Zod to perform real-time, zero-lag validation with minimal component re-renders."*

---

*Document generated for technical interview preparation and engineering architecture review.*
