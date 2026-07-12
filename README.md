# ResumeGenie 🧞‍♂️

ResumeGenie is an advanced, AI-powered ATS (Applicant Tracking System) resume analyzer. It helps job seekers tailor their resumes for specific job descriptions by providing detailed, actionable feedback, ATS scoring, and keyword analysis.

## 🚀 Features

- **AI-Powered Analysis:** Leverages Google's Gemini 2.5 Flash model for lightning-fast, highly accurate resume parsing and feedback.
- **Comprehensive ATS Scoring:** Get an overall ATS score, plus detailed breakdowns across categories like Keyword Match, Experience Relevance, and Formatting.
- **Smart Recommendations:** Receive actionable "quick fixes" and "before-and-after" bullet point improvements.
- **Cloud-Native Storage:** Securely uploads and streams PDF resumes directly via **Cloudinary**.
- **Real Email Notifications:** Built-in secure SMTP integration for password resets and alerts.
- **Modern UI/UX:** A highly professional, responsive dashboard built with Next.js and Tailwind CSS, featuring smooth scroll interactions and beautiful data visualizations.
- **Robust Security:** Protected against common vulnerabilities using Helmet, XSS-Clean, Mongo-Sanitize, and Rate Limiting.

## 💻 Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons, React-PDF
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **AI & Integrations:** Google Gemini SDK, Cloudinary, Nodemailer, JSON Web Tokens (JWT)

## 📂 Project Structure

The project is structured as a monorepo containing both the client and server applications:

- `/frontend` - The Next.js React application.
- `/backend` - The Node.js / Express API server.

## 🛠️ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ResumeGenie.git
cd ResumeGenie
```

### 2. Setup the Backend
Navigate to the backend directory, install dependencies, and setup your environment variables.
```bash
cd backend
npm install
```
*(See the `backend/README.md` for required environment variables).*

### 3. Setup the Frontend
Navigate to the frontend directory and install dependencies.
```bash
cd ../frontend
npm install
```

### 4. Run the Application
You will need two terminal windows to run both servers concurrently.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` in your browser to start analyzing resumes!

## 📜 License
This project is proprietary. All rights reserved.
