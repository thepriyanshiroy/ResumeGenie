# ResumeGenie — Frontend

This is the frontend application for **ResumeGenie** (ResumeAI), an AI-powered resume analyzer built with Next.js, Tailwind CSS v4, and React.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🚀 Daily Progress Report - July 2, 2026

Today, we successfully translated the design blueprint and reference images into a fully functional frontend application. We built the complete landing page, established the core design system, and implemented a robust, fully-integrated authentication system connecting the Next.js frontend to the Express backend.

### 1. Core Design System & Landing Page
*   **Design Tokens & CSS Variables:** Configured `globals.css` with all exact HSL color tokens, typography settings, shadows, and gradients specified in the blueprint using Tailwind CSS v4.
*   **Typography Setup:** Integrated **Playfair Display** (for elegant headings), **Inter** (for clean body text), and **JetBrains Mono** via Next.js Google Fonts optimization.
*   **Landing Page Components:** 
    *   Created the **Hero** section with premium typography and the decorative spark icon.
    *   Built the **Features** section with responsive, soft-shadow hover cards.
    *   Designed the **Navbar** with custom logo styling and smooth navigation buttons.
    *   Developed a reusable, highly customizable **Button** component featuring a `premium` gradient variant.

### 2. Authentication UI & Layouts
*   **Auth Layout:** Designed a beautiful, centered white-card layout (`AuthLayout`) floating over a subtle blue gradient background, directly inspired by the provided "Analyse Resume Form" design.
*   **Form Validation:** Integrated `react-hook-form` and `zod` across all authentication forms to ensure robust client-side validation (e.g., matching passwords, valid emails).
*   **User Feedback:** Integrated `react-hot-toast` into the root layout to provide instant, beautiful popup notifications for successes and errors.
*   **Navigation:** Added a seamless `<- Back` button in the auth layout to improve user navigation.

### 3. Backend API Integration & Dashboard
*   **Axios Configuration:** Created a centralized `axios` instance (`src/lib/axios.js`) configured with credentials to securely handle JWT cookies.
*   **Auth Pages:** Built and fully wired up the following routes to the backend:
    *   `/login` 
    *   `/signup`
    *   `/forgot-password`
*   **Dashboard Routing:** Built the `/dashboard` route as a landing zone for authenticated users.
*   **Secure Logout:** Created `DashboardNavbar.jsx` with a logout button that securely invalidates the session via the backend API and redirects to the home page.

### 4. Backend Bug Fixes & Improvements
*   **Express 5 Crash Fix:** Identified and resolved a critical backend crash caused by legacy security middlewares (`hpp`, `xss-clean`, `express-mongo-sanitize`) attempting to overwrite the read-only `req.query` object in Express 5.
*   **Revamped Password Reset Flow:**
    *   *Backend:* Overhauled the `forgotPassword` controller to send a clean, user-friendly email pointing to a frontend URL instead of raw API endpoints.
    *   *Frontend:* Built the dynamic `/reset-password/[token]` page. This allows users to click the link in their email and securely type a new password directly in the web app, automatically logging them in upon success.

---

## ⏭️ Next Steps
With the foundation and authentication fully established, the next major milestones include:
1. Building the **Analyse Resume Form** (`/analyze`) with drag-and-drop file upload.
2. Implementing the **Processing Screen** with animated loading states.
3. Building the **Results Dashboard** to display the parsed ATS score, keyword matching, and AI suggestions.
