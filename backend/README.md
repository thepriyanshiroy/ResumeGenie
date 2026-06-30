# ResumeGenie Backend Documentation

This document provides a comprehensive overview of the ResumeGenie Node.js backend. It details the architecture, libraries used, API endpoints, and critical production considerations.

---

## 📦 Tech Stack & Libraries

The backend is built on **Node.js** and **Express.js**, utilizing **MongoDB** as the database. Below is a detailed breakdown of the installed packages:

### Core Framework & Database
*   **express (`^5.2.1`)**: The core web framework for routing and handling HTTP requests.
*   **mongoose (`^9.7.2`)**: The Object Data Modeling (ODM) library for MongoDB, used to define schemas and interact with the database.
*   **dotenv (`^17.4.2`)**: Loads environment variables from the `config.env` file.

### Authentication & Security
*   **bcryptjs (`^3.0.3`)**: Used to securely hash and salt user passwords before saving them to the database.
*   **jsonwebtoken (`^9.0.3`)**: Generates JWTs for stateless user authentication via HTTP-only cookies.
*   **helmet**: Secures the Express app by setting various HTTP headers (e.g., hiding `X-Powered-By`, setting HSTS).
*   **express-rate-limit**: Prevents brute-force and DDoS attacks by limiting IP requests (currently 100 requests per hour).
*   **express-mongo-sanitize**: Prevents NoSQL query injection attacks by stripping prohibited characters (like `$`) from user input.
*   **xss-clean**: Sanitizes user input to prevent Cross-Site Scripting (XSS) attacks.
*   **hpp**: Protects against HTTP Parameter Pollution attacks by ignoring duplicate query string parameters.
*   **validator (`^13.15.35`)**: Used inside Mongoose schemas to validate strings (like ensuring valid email formats).

### Features & Integrations
*   **@google/genai (`^2.10.0`)**: The official Google SDK used to communicate with the Gemini API (specifically `gemini-2.5-flash`) for ATS resume analysis.
*   **multer (`^2.2.0`)**: Middleware for handling `multipart/form-data`, specifically used for securely uploading PDF and DOCX files.
*   **pdf-parse (`^1.1.1`)**: Extracts raw text from uploaded PDF files so it can be fed into the Gemini API.
*   **nodemailer (`^9.0.1`)**: Handles sending emails (specifically used for the "Forgot Password" flow).

### Optimization & Logging
*   **compression**: Gzips JSON responses before sending them to the client, drastically reducing payload sizes and improving API speed.
*   **morgan (`^1.11.0`)**: Used in the `development` environment for clean HTTP request logging in the console.
*   **cors (`^2.8.6`)**: Manages Cross-Origin Resource Sharing. Configured strictly to only accept requests from your designated frontend URL.
*   **winston**: The production-grade logger. It writes application errors and info to physical log files (`logs/error.log` and `logs/combined.log`) instead of relying solely on `console.log`.

---

## 🚀 API Endpoints & Functionality

### Authentication Routes (`/api/v1/users`)
All auth routes handle the JWT via secure, HTTP-only cookies to protect against XSS token theft.

*   `POST /signup`: Registers a new user. Hashes the password and immediately logs them in by sending a JWT cookie.
*   `POST /login`: Compares the provided password with the hashed database password. Returns a JWT cookie on success.
*   `GET /logout`: Clears the JWT cookie by replacing it with a dummy string that expires in 10 seconds.
*   `POST /forgotPassword`: Takes an email, generates a secure random reset token, saves the hashed token to the DB (valid for 10 mins), and emails the raw token via Nodemailer.
*   `PATCH /resetPassword/:token`: Takes the token from the URL and new passwords from the body to securely overwrite the forgotten password.
*   `PATCH /updatePassword`: *(Requires Auth)* Allows a logged-in user to change their password by verifying their current password first.

### Resume Routes (`/api/v1/resumes`)
*Requires Auth: All routes below are protected by an auth middleware that verifies the JWT cookie and attaches the User object to the request.*

*   `POST /`: **Upload Resume**. Uses `multer` to accept a PDF/DOCX file (max 5MB). Saves the file to the local `uploads/` folder, uses `pdf-parse` to extract the text, and saves the record to MongoDB.
*   `GET /`: **Get All Resumes**. Retrieves resumes for the logged-in user. Includes built-in pagination and sorting capabilities (e.g., `?page=1&limit=10&sort=-createdAt`).
*   `GET /:id`: **Get Single Resume**. Fetches a specific resume belonging to the logged-in user.
*   `DELETE /:id`: **Delete Resume**. Handles complex cleanup: 
    1. Removes the resume record from MongoDB.
    2. Deletes the physical PDF/DOCX file from the server using `fs.unlink`.
    3. Cascades the delete to wipe out any associated AI Analysis records.
*   `POST /:id/analyze`: **Analyze Resume**. Fetches the extracted text from the database, builds a prompt using `utils/resumePrompt.js`, and pings the Gemini API. It then cleans the response, parses the JSON, and saves the detailed ATS analysis to a new `ResumeAnalysis` collection.
*   `GET /:id/analysis`: **Get Analysis**. Fetches the saved AI analysis report for a specific resume.

---

## ⚠️ Important Production Considerations

Before deploying this backend to a live server, the following aspects must be understood:

### 1. Ephemeral Storage vs. Local Files
Currently, resumes are uploaded to the local `uploads/` directory on the server. 
*   **The Danger**: Modern cloud hosting platforms (like Vercel, Heroku, or Render) use "ephemeral filesystems". This means that whenever your server goes to sleep, restarts, or deploys a new update, **the entire `uploads/` folder will be wiped out**, resulting in broken files.
*   **The Solution**: When you are ready for final deployment, the `uploadMiddleware.js` and controller must be refactored to upload files directly to a cloud bucket like **AWS S3**, **Cloudinary**, or **Firebase Storage**.

### 2. Environment Variables (.env)
Your server relies heavily on environment variables that **must** be set on your production server:
*   `DATABASE`: Your MongoDB connection string.
*   `JWT_SECRET`: A very long, highly secure random string for signing cookies.
*   `GEMINI_API_KEY`: Your Google Gemini API key.
*   `FRONTEND_URL`: Used by CORS to restrict API access (e.g., `https://my-react-app.com`).
*   `NODE_ENV`: Must be explicitly set to `production` so that Winston logging engages correctly and Morgan is disabled.

### 3. Rate Limiting Limits
The API is currently limited to **100 requests per hour per IP address**. 
*   If multiple users share a single public IP address (like in a corporate office or university network), they might hit this limit quickly. You may need to adjust this limit in `server.js` based on real-world traffic patterns.

### 4. Application Logging
Crash reports and application info are no longer just spat out into the console. They are captured by Winston and written to the `logs/` directory. If your server encounters an `uncaughtException`, you must check `logs/error.log` to diagnose the crash.

### 5. AI Parsing Guarantees
The `geminiService.js` expects the Gemini API to return a strictly formatted JSON string. If the AI hallucinates and returns conversational text instead of JSON, the `try/catch` block will trigger, throwing a 500 Error (`Failed to parse AI response as JSON`). This is intentional, but frontend applications should be prepared to handle 500 errors gracefully and prompt the user to "Try Again".
