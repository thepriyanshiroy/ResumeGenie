# ResumeGenie - Frontend Client

This is the Next.js frontend application for ResumeGenie. It provides a beautiful, modern, and highly responsive user interface for uploading resumes and viewing detailed AI-generated ATS analysis.

## 🎨 Technologies Used

- **Next.js (App Router)** - React framework for production.
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development.
- **Lucide React** - Beautiful, consistent iconography.
- **React-PDF** - For rendering PDF preview thumbnails and modals.
- **Axios** - For making HTTP requests to the backend API.
- **React Hot Toast** - For elegant, accessible notifications.

## 📁 Directory Structure

- `/src/app`: Next.js App Router pages (Dashboard, Analysis, Auth, etc.).
- `/src/components`: Reusable UI components (Navbars, PDF Viewers, Cards).
- `/src/lib`: Utility functions and Axios configurations.
- `/public`: Static assets.

## ⚙️ Environment Configuration

By default, the frontend is configured to communicate with the local backend running on `http://localhost:5000`. 
This is configured in `src/lib/axios.js`.

To configure for production, ensure the `NEXT_PUBLIC_API_URL` environment variable is set to your deployed backend domain.

## 🚀 Getting Started

First, install the dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ✨ UI/UX Highlights
- **Dynamic Sticky Layouts:** The analysis page features a professional split-pane design where the resume preview locks in place while scrolling through detailed feedback.
- **Animated SVG Data:** ATS scores are rendered using custom SVG rings with smooth stroke animations.
- **Loading States:** Comprehensive loading skeletons and spinners ensure users are never left guessing while the AI processes their documents.
