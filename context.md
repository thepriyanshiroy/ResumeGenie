# ResumeGenie Project Context

Last reviewed by Codex: 2026-07-26

## What This Project Is

ResumeGenie is an AI-powered resume analyzer. Users sign up or log in, upload a resume with target job details, and receive an ATS-style analysis with scores, keyword coverage, strengths, improvement areas, and AI rewrite suggestions.

The repository is a two-app JavaScript project:

- `frontend/`: Next.js App Router client.
- `backend/`: Express/MongoDB API.

There is also a root `package.json`, but it only declares `@google/genai`; practical development happens inside `frontend` and `backend`.

## Tech Stack

Frontend:

- Next.js `16.2.10` with App Router.
- React `19.2.4`.
- Tailwind CSS v4 via `@import "tailwindcss"` and theme variables in `frontend/src/app/globals.css`.
- `lucide-react` for icons.
- `react-hook-form`, `zod`, and `@hookform/resolvers` for auth forms.
- `axios` for API calls.
- `react-hot-toast` for notifications.
- `react-dropzone` for uploads.
- `react-pdf` for PDF thumbnails and modal preview.
- `recharts` is installed, though current result charts are mostly custom SVG/progress UI.
- `frontend/next.config.mjs` enables React Compiler and sets `turbopack.root` to the frontend directory to avoid multiple-lockfile workspace-root warnings.

Backend:

- Node.js with Express `5.2.1`.
- MongoDB via Mongoose `9.7.2`.
- Google Gemini SDK `@google/genai`, using model `gemini-2.5-flash`.
- JWT auth with `jsonwebtoken`.
- Password hashing with `bcryptjs`.
- File uploads with `multer`.
- Optional Cloudinary storage with `multer-storage-cloudinary`; otherwise local `uploads/`.
- PDF text extraction with `pdf-parse`.
- Email currently uses Brevo API through `axios`, despite README references to Nodemailer/SMTP.
- Security middleware includes `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `xss-clean`, `hpp`, and `compression`.
- Logging uses Winston to `logs/error.log` and `logs/combined.log`, plus console outside production.

## Run Commands

Backend:

```bash
cd backend
npm install
npm run dev
```

Backend production:

```bash
cd backend
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

There are no meaningful automated tests configured yet. `backend npm test` intentionally exits with an error placeholder.

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend API base: `http://localhost:5000/api/v1`
- Backend health/root: `http://localhost:5000/`

## Environment Variables

Backend loads `backend/config.env` from `server.js` with:

```js
dotenv.config({ path: "./config.env" });
```

Expected by code:

- `NODE_ENV`
- `PORT`
- `FRONTEND_URL`
- `DATABASE`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_COOKIE_EXPIRES_IN`
- `GEMINI_API_KEY`
- `BREVO_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Important mismatch: `backend/config.env.example` currently only contains SMTP-style keys:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

That example is stale relative to the code. `backend/README.md` also describes SMTP/Nodemailer, while `backend/src/utils/email.js` sends email through Brevo.

Frontend API base is configured in `frontend/src/lib/axios.js`:

```js
process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"
```

## Backend Structure

Entry point:

- `backend/server.js`

Main server behavior:

- Forces DNS default result order to IPv4 first.
- Loads `config.env`.
- Connects to MongoDB with `src/config/db.js`.
- Applies security, CORS, parsing, sanitization, compression, and static upload middleware.
- Mounts routes:
  - `/api/v1/users`
  - `/api/v1/resumes`
- Serves local uploaded files from `/uploads`.

Database connection:

- `backend/src/config/db.js`
- Replaces `<PASSWORD>` in `process.env.DATABASE` with `process.env.DATABASE_PASSWORD`.

Routes:

- `backend/src/routes/authRoutes.js`
  - `POST /signup`
  - `POST /login`
  - `POST /forgotPassword`
  - `PATCH /resetPassword/:token`
  - `PATCH /updatePassword` protected
  - `GET /logout`
  - `POST /logout`
- `backend/src/routes/resumeRoutes.js`
  - All routes protected by `authMiddleware.protect`.
  - `POST /upload`
  - `GET /`
  - `GET /:id`
  - `DELETE /:id`
  - `POST /:id/analyze`
  - `GET /:id/analyze`

Controllers:

- `backend/src/controllers/authController.js`
  - Creates JWT tokens and sets `jwt` HTTP-only cookies.
  - Also returns the token in JSON, and the frontend stores it in `localStorage`.
  - Forgot/reset password flow creates a hashed reset token on the user document.
- `backend/src/controllers/resumeController.js`
  - Creates resume records after upload.
  - Parses uploaded file with `parsePDF`.
  - Lists resumes for the logged-in user and populates `analysis`.
  - Deletes resume files and associated analyses.
  - Runs Gemini analysis once and caches it on the resume via `resume.analysis`.

Middleware:

- `backend/src/middlewares/authMiddleware.js`
  - Reads only `Authorization: Bearer <token>` from headers.
  - Does not read the `jwt` cookie, even though the backend sets it.
- `backend/src/middlewares/uploadMiddleware.js`
  - Accepts PDF and DOCX MIME types.
  - Enforces 5 MB max upload size.
  - Stores in Cloudinary if `CLOUDINARY_CLOUD_NAME` is present, otherwise local `uploads/`.

Utilities/services:

- `backend/src/services/geminiService.js`
  - Calls Gemini with a strict JSON response schema.
  - Retries up to 4 times for 503 errors with exponential backoff.
  - Parses `response.text` after stripping markdown code fences.
- `backend/src/utils/resumePrompt.js`
  - Prompt asks for concise ATS feedback matching UI fields.
- `backend/src/utils/pdfParser.js`
  - Parses local or HTTP PDF files only.
  - Despite upload accepting DOCX, this parser uses `pdf-parse`; DOCX uploads are likely unsupported downstream.
- `backend/src/utils/email.js`
  - Sends password reset email through Brevo API using `BREVO_API_KEY`.
- `backend/src/controllers/errorController.js`
  - Always returns error details and stack; not production-redacted.

## Backend Data Models

`User` (`backend/src/models/User.js`):

- Fields: `name`, `email`, `password`, `passwordConfirm`, `passwordChangedAt`, reset token fields, `active`.
- Password is `select: false` and hashed in a pre-save hook.
- Query middleware hides users with `active: false`.
- Methods: `correctPassword`, `changedPasswordAfter`, `createPasswordResetToken`.

`Resume` (`backend/src/models/resumeModel.js`):

- Belongs to `user`.
- Job fields: `companyName`, `jobTitle`, `jobDescription`.
- File fields: `originalFileName`, `storedFileName`, `filePath`, `mimeType`, `fileSize`.
- `mimeType` allows PDF and DOCX.
- `extractedText`, `analysis`, and `status`.
- Delete hook also deletes linked analysis and physical/cloud file.

`ResumeAnalysis` (`backend/src/models/resumeAnalysisModel.js`):

- Belongs to `resume` and `user`.
- Main sections:
  - `resumeSections`
  - `overallAnalysis`
  - `scoreBreakdown`
  - `keywordAnalysis`
  - `strengths`
  - `improvements`
  - `aiSuggestions`
  - `estimatedImprovement`
  - `analysisStatus`

The Gemini JSON schema in `geminiService.js` mirrors this model closely. Keep model, schema, prompt, and results UI in sync when changing analysis shape.

## Frontend Structure

App routes:

- `frontend/src/app/page.js`: marketing landing page.
- `frontend/src/app/(auth)/layout.js`: shared auth card layout.
- `frontend/src/app/(auth)/login/page.js`: login form.
- `frontend/src/app/(auth)/signup/page.js`: signup form.
- `frontend/src/app/(auth)/forgot-password/page.js`: forgot password.
- `frontend/src/app/(auth)/reset-password/[token]/page.js`: reset password.
- `frontend/src/app/dashboard/page.js`: list uploaded resumes/analyses.
- `frontend/src/app/analyze/page.js`: upload resume and job details.
- `frontend/src/app/processing/page.js`: triggers analysis and redirects.
- `frontend/src/app/results/[id]/page.js`: detailed analysis view and PDF preview.

Shared components:

- `frontend/src/components/layout/Navbar.jsx`: landing nav.
- `frontend/src/components/dashboard/DashboardNavbar.jsx`: app nav and logout.
- `frontend/src/components/landing/Hero.js`
- `frontend/src/components/landing/Features.js`
- `frontend/src/components/shared/PdfThumbnail.js`
- `frontend/src/components/shared/PdfViewerModal.js`
- `frontend/src/components/ui/Button.jsx`
- `frontend/src/components/ui/Input.jsx`
- `frontend/src/components/ui/Label.jsx`

API client:

- `frontend/src/lib/axios.js`
- Uses `withCredentials: true`.
- Adds `Authorization: Bearer <token>` from `localStorage`.

Auth/session behavior:

- Login/signup/reset password store `response.data.token` in `localStorage`.
- Protected frontend routes do not appear to have middleware/guards yet.
- Logout calls `GET /users/logout`, removes `localStorage.token`, and redirects home.

Upload/analyze flow:

1. `/analyze` collects file plus `companyName`, `jobTitle`, `jobDescription`, and `experienceLevel`.
2. Sends `POST /resumes/upload` with multipart form field `resume`.
3. Backend creates a `Resume`, parses the uploaded file, sets status to `parsed`, and returns the resume id.
4. Frontend navigates to `/processing?id=<resumeId>`.
5. `/processing` calls `POST /resumes/<id>/analyze`.
6. Backend runs Gemini unless an analysis already exists.
7. Frontend redirects to `/results/<id>`.
8. `/results/[id]` fetches both `GET /resumes/<id>` and `GET /resumes/<id>/analyze`.

PDF preview behavior:

- `PdfThumbnail` and `PdfViewerModal` are dynamically imported with SSR disabled.
- Both use `react-pdf` and set PDF.js worker to unpkg:
  - `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
- Local file URLs are built by removing `/api/v1` from API base and appending `/uploads/<storedFileName>`.
- Cloudinary URLs use `resume.filePath` directly.
- `PdfViewerModal` computes a viewport-safe page width and constrains PDF canvases to avoid mobile horizontal overflow.

## Styling and UI Conventions

Global styles live in `frontend/src/app/globals.css`.

Theme:

- Light, clean blue/slate palette.
- Primary is `hsl(220 80% 55%)`.
- Display font: Playfair Display.
- Body font: Inter.
- Mono font: JetBrains Mono.

Conventions currently used:

- Tailwind utility classes inline in components.
- App cards generally use `rounded-2xl`; reusable `Button`, `Input`, and modal controls use `rounded-xl`.
- Lucide icons are standard.
- Main app background is often `#F5F9FC`.
- Card borders commonly use `#E2E8F0` or `border-border`.
- Auth and dashboard surfaces use soft shadows and white cards.
- Global layout uses `overflow-x-hidden`; `globals.css` defines `safe-x` for safe-area horizontal padding and `no-scrollbar` for hidden-scrollbar panels.
- The responsive refactor favors mobile-first spacing, `min-w-0` on shrinkable flex/grid children, adaptive grids, and smaller mobile headings.

Note: Several files contain mojibake characters, especially where dashes, bullets, checkmarks, arrows, and emoji were intended. Preserve ASCII when editing unless intentionally fixing encoding.

## Known Issues and Gotchas

- `backend/config.env.example` is incomplete/stale. It does not list the variables actually required by the app.
- `backend/README.md` says Nodemailer/SMTP, but email code uses Brevo API.
- Upload accepts DOCX, but `pdfParser.js` only supports PDF parsing with `pdf-parse`.
- Backend sets JWT cookies, but `authMiddleware.protect` only reads the Authorization Bearer header.
- `deleteResume` may delete files twice: `resumeController.deleteResume` manually deletes file/analysis after `findOneAndDelete`, and `resumeModel` also has a `pre('findOneAndDelete')` hook that deletes them.
- `resumeController.analyzeResume` uses `Resume.findById(req.params.id)` without checking `user`, so a user with a valid token could potentially analyze another user's resume by id. `getResumeAnalysis` is user-scoped.
- `errorController.js` always returns stack traces and full error objects.
- `User.createPasswordResetToken` logs reset tokens to console.
- `DashboardNavbar` imports `api.get("/users/logout")`; backend supports both GET and POST logout.
- `frontend/next.config.mjs` enables `reactCompiler: true` and `turbopack.root`.
- `node_modules/` exists at repo root and is not ignored by current `.gitignore`; backend/frontend node_modules are ignored.
- `backend/uploads/` contains at least one sample PDF and is not ignored in `.gitignore`.
- Browser-based responsive validation was attempted with Playwright, but this Windows environment lacked Chrome at the path expected by Playwright CLI. Lint and production build passed after the responsive refactor.

## Editing Guidance for Future Codex Work

- Prefer changing the app inside `frontend/` or `backend/`; root package files are probably incidental unless dependency cleanup is requested.
- Keep analysis contract changes synchronized across:
  - `backend/src/models/resumeAnalysisModel.js`
  - `backend/src/services/geminiService.js`
  - `backend/src/utils/resumePrompt.js`
  - `frontend/src/app/results/[id]/page.js`
- Keep upload behavior synchronized across:
  - `frontend/src/app/analyze/page.js`
  - `backend/src/middlewares/uploadMiddleware.js`
  - `backend/src/utils/pdfParser.js`
- For frontend API calls, use the shared Axios instance from `@/lib/axios`.
- For UI, match the existing Tailwind style and use lucide icons when adding controls.
- For responsive UI work, preserve the current mobile-first pattern: `safe-x`, constrained max widths, `min-w-0`, adaptive grids, and viewport-safe PDF sizing.
- For auth forms, follow the existing `react-hook-form` + `zod` pattern.
- Avoid relying on cookies for authenticated API calls unless `authMiddleware.protect` is updated to read them.
- Run frontend lint/build after UI changes when feasible.
- For backend changes, at minimum run the server or targeted manual API checks; no backend tests currently exist.
