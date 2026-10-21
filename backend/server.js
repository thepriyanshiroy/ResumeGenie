const express = require("express");
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const logger = require("./src/utils/logger");

const AppError = require("./src/utils/appError");
const globalErrorHandler = require("./src/controllers/errorController");
const { preventInjection, preventSecretLeakage } = require("./src/middlewares/securityMiddleware");
const authRoutes = require("./src/routes/authRoutes");
const resumeRouter = require("./src/routes/resumeRoutes");

process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(`${err.name}: ${err.message}`);
  process.exit(1);
});

const connectDB = require("./src/config/db");

connectDB();

const app = express();

// Disable X-Powered-By header to hide server framework
app.disable('x-powered-by');

// Trust proxy for Render / Cloud deployments (required for rate-limiting and secure cookies)
app.set('trust proxy', 1);

// Comprehensive Helmet Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows static PDF uploads to be fetched by frontend
  crossOriginOpenerPolicy: { policy: "same-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Custom security headers and anti-caching for API responses
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent caching of sensitive API data in client/proxy caches
  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Response interceptor: automatically strip and redact any credentials/API keys from JSON responses
app.use(preventSecretLeakage);

// Implement strict CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again in an hour!"
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Express 5 compatibility fix for security middlewares mutating req.query
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true
  });
  next();
});

// Prevent SQL and NoSQL Injection attacks on parameters, queries, and bodies
app.use(preventInjection);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compress text responses
app.use(compression());

// Serve uploads folder statically
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ResumeGenie API Running",
  });
});

app.use("/api/v1/users", authRoutes);
app.use("/api/v1/resumes", resumeRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
  logger.error(`${err.name}: ${err.message}`);

  server.close(() => {
    process.exit(1);
  });
});