# ResumeGenie - Backend API

This is the Node.js/Express backend server for ResumeGenie. It handles user authentication, PDF file processing, AI communication with Google Gemini, and database interactions.

## 🏗️ Architecture

- **Express.js** for the RESTful API framework.
- **MongoDB & Mongoose** for data persistence.
- **Google Gemini 2.5 Flash** for intelligent text extraction and ATS analysis.
- **Cloudinary** for secure, remote PDF storage.
- **Nodemailer** for sending secure transactional emails.
- **Multer** for multipart/form-data file uploads.

## ⚙️ Environment Variables

To run the backend, create a `config.env` file in the root of the `backend` directory with the following keys:

```env
NODE_ENV=development
PORT=5000

# Database
DATABASE=mongodb://your_mongo_connection_string
DATABASE_PASSWORD=your_password

# JWT Authentication
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USERNAME=your.email@gmail.com
EMAIL_PASSWORD=your_app_password

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary (Optional, falls back to local disk if omitted)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in the development mode using `nodemon`. The server will automatically restart if you edit files.

### `npm start`
Runs the app in production mode.

## 🛡️ Security Features
- **helmet**: Secures HTTP headers.
- **express-rate-limit**: Prevents brute-force attacks.
- **express-mongo-sanitize**: Prevents NoSQL query injection.
- **xss-clean**: Protects against cross-site scripting.
- **hpp**: Prevents HTTP Parameter Pollution.
