const fs = require('fs');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Regex patterns targeting dangerous SQL injection, comment sequences, and XSS payloads
const SQL_INJECTION_PATTERNS = [
  /('|\")\s*(OR|AND)\s+['"\d\w]+\s*=\s*['"\d\w]+/i,           // ' OR '1'='1' or " AND 1=1
  /\b(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i,                // OR 1=1
  /('|\")\s*(--|#|\/\*)/,                                      // ' -- or " -- or '/*
  /\bUNION\s+(ALL\s+)?SELECT\b/i,                             // UNION SELECT
  /\b(DROP|ALTER|TRUNCATE)\s+TABLE\b/i,                        // DROP TABLE
  /\bINSERT\s+INTO\b/i,                                        // INSERT INTO
  /\bDELETE\s+FROM\b/i,                                        // DELETE FROM
  /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|UNION)\b/i, // ; DROP etc.
  /\bEXEC(\s+XP_)?\b/i,                                        // EXEC xp_cmdshell
  /<script\b[^>]*>/i,                                          // <script>
  /javascript:/i,                                              // javascript:
  /\bon[a-z]+\s*=\s*['"]/i                                     // onerror="
];

/**
 * Checks if a string value contains malicious SQL injection or script patterns.
 * @param {string} value
 * @returns {boolean}
 */
function containsSqlInjection(value) {
  if (typeof value !== 'string') return false;
  if (value.length < 3) return false;
  for (const regex of SQL_INJECTION_PATTERNS) {
    if (regex.test(value)) return true;
  }
  return false;
}

exports.containsSqlInjection = containsSqlInjection;

/**
 * Recursively scans and sanitizes an object against NoSQL ($ or .) and SQL injection.
 */
function sanitizeInput(obj, checkSql = false) {
  if (!obj || typeof obj !== 'object') {
    if (checkSql && typeof obj === 'string' && containsSqlInjection(obj)) {
      return { clean: obj, isMalicious: true, reason: 'Detected SQL injection pattern' };
    }
    return { clean: obj, isMalicious: false };
  }

  if (Array.isArray(obj)) {
    const cleanedArr = [];
    for (const item of obj) {
      const res = sanitizeInput(item, checkSql);
      if (res.isMalicious) return res;
      cleanedArr.push(res.clean);
    }
    return { clean: cleanedArr, isMalicious: false };
  }

  const cleanedObj = {};
  for (const key of Object.keys(obj)) {
    // Prohibit NoSQL injection operators ($gt, $ne, $where, etc.) and dot notation
    if (key.startsWith('$') || key.includes('.')) {
      return {
        clean: obj,
        isMalicious: true,
        reason: `Prohibited operator or key: ${key}`
      };
    }

    const res = sanitizeInput(obj[key], checkSql);
    if (res.isMalicious) return res;
    cleanedObj[key] = res.clean;
  }

  return { clean: cleanedObj, isMalicious: false };
}

/**
 * Middleware: Global defense against SQL and NoSQL Injection attacks.
 */
exports.preventInjection = (req, res, next) => {
  // 1. Sanitize URL parameters and Query string (strict check: both SQL and NoSQL)
  if (req.params) {
    const paramsCheck = sanitizeInput(req.params, true);
    if (paramsCheck.isMalicious) {
      logger.warn(`Blocked injection attack in req.params from ${req.ip}: ${paramsCheck.reason}`);
      return next(new AppError('Invalid input detected in request URL parameters.', 400));
    }
  }

  if (req.query) {
    const queryCheck = sanitizeInput(req.query, true);
    if (queryCheck.isMalicious) {
      logger.warn(`Blocked injection attack in req.query from ${req.ip}: ${queryCheck.reason}`);
      return next(new AppError('Invalid input detected in query parameters.', 400));
    }
  }

  // 2. Sanitize Request Body (JSON bodies)
  if (req.body) {
    const isAuthRoute = req.originalUrl && req.originalUrl.includes('/users/');
    const bodyCheck = sanitizeInput(req.body, isAuthRoute);

    if (bodyCheck.isMalicious) {
      logger.warn(`Blocked injection attack in req.body from ${req.ip}: ${bodyCheck.reason}`);
      return next(new AppError('Invalid input payload detected.', 400));
    }

    req.body = bodyCheck.clean;
  }

  next();
};

/**
 * Middleware: Request validation for Resume Upload (Multipart form-data).
 * Enforces strict type checking, length constraints, and SQL/XSS injection prevention.
 */
exports.validateResumeUpload = (req, res, next) => {
  const { companyName, jobTitle, jobDescription, experienceLevel } = req.body || {};

  function cleanUpTempFile() {
    if (req.file && req.file.path && !req.file.path.startsWith('http')) {
      try {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } catch (e) {
        logger.error(`Error deleting rejected upload file: ${e.message}`);
      }
    }
  }

  // 1. Validate File
  if (!req.file) {
    return next(new AppError('Please upload a resume file (PDF).', 400));
  }
  const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    cleanUpTempFile();
    return next(new AppError('Invalid file type: Only PDF resumes are supported.', 400));
  }
  if (req.file.size > 5 * 1024 * 1024) {
    cleanUpTempFile();
    return next(new AppError('File size exceeds 5 MB limit.', 400));
  }

  // 2. Validate Company Name
  if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2) {
    cleanUpTempFile();
    return next(new AppError('Validation Error: Company name must be at least 2 characters.', 400));
  }
  if (companyName.trim().length > 100) {
    cleanUpTempFile();
    return next(new AppError('Validation Error: Company name must not exceed 100 characters.', 400));
  }
  if (containsSqlInjection(companyName)) {
    cleanUpTempFile();
    logger.warn(`Blocked SQL injection attempt in companyName from ${req.ip}`);
    return next(new AppError('Security Alert: Potential SQL/script injection pattern detected in company name.', 400));
  }

  // 3. Validate Job Title
  if (!jobTitle || typeof jobTitle !== 'string' || jobTitle.trim().length < 2) {
    cleanUpTempFile();
    return next(new AppError('Validation Error: Job title must be at least 2 characters.', 400));
  }
  if (jobTitle.trim().length > 100) {
    cleanUpTempFile();
    return next(new AppError('Validation Error: Job title must not exceed 100 characters.', 400));
  }
  if (containsSqlInjection(jobTitle)) {
    cleanUpTempFile();
    logger.warn(`Blocked SQL injection attempt in jobTitle from ${req.ip}`);
    return next(new AppError('Security Alert: Potential SQL/script injection pattern detected in job title.', 400));
  }

  // 4. Validate Experience Level
  const validLevels = ['Intern', 'Entry', 'Mid', 'Senior', 'Lead'];
  if (!experienceLevel || !validLevels.includes(experienceLevel)) {
    cleanUpTempFile();
    return next(new AppError('Validation Error: Experience level must be one of: Intern, Entry, Mid, Senior, Lead.', 400));
  }

  // 5. Validate Job Description
  if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 30) {
    cleanUpTempFile();
    return next(new AppError('Validation Error: Job description must be at least 30 characters for meaningful ATS matching.', 400));
  }
  if (jobDescription.trim().length > 10000) {
    cleanUpTempFile();
    return next(new AppError('Validation Error: Job description must not exceed 10,000 characters.', 400));
  }
  if (containsSqlInjection(jobDescription)) {
    cleanUpTempFile();
    logger.warn(`Blocked SQL injection attempt in jobDescription from ${req.ip}`);
    return next(new AppError("Security Alert: Potential SQL/script injection pattern detected in job description (' OR '1'='1' --).", 400));
  }

  next();
};

/**
 * Middleware: Intercepts JSON response to ensure no sensitive credentials,
 * API keys, or system secrets are accidentally leaked to DevTools/Network tab.
 */
exports.preventSecretLeakage = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (body) {
    if (body !== undefined && body !== null && typeof body === 'object') {
      try {
        const plainBody = JSON.parse(JSON.stringify(body));
        const sanitized = redactSecrets(plainBody);
        return originalJson.call(this, sanitized);
      } catch (e) {
        return originalJson.call(this, body);
      }
    }
    return originalJson.call(this, body);
  };

  next();
};

function getKnownSecrets() {
  const secrets = [
    process.env.GEMINI_API_KEY,
    process.env.JWT_SECRET,
    process.env.BREVO_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
    process.env.CLOUDINARY_API_KEY,
    process.env.DATABASE_PASSWORD,
    process.env.EMAIL_PASSWORD
  ].filter(s => typeof s === 'string' && s.length > 5);

  return secrets;
}

function redactSecrets(data, seen = new WeakSet(), depth = 0) {
  if (depth > 20) return data;

  if (!data || typeof data !== 'object') {
    if (typeof data === 'string') {
      let cleaned = data;
      const secrets = getKnownSecrets();
      for (const s of secrets) {
        if (cleaned.includes(s)) {
          cleaned = cleaned.split(s).join('[REDACTED_SECRET]');
        }
      }
      return cleaned;
    }
    return data;
  }

  if (seen.has(data)) {
    return '[Circular]';
  }
  seen.add(data);

  if (Array.isArray(data)) {
    return data.map(item => redactSecrets(item, seen, depth + 1));
  }

  const result = {};
  const sensitiveFieldNames = [
    'password',
    'passwordConfirm',
    'passwordResetToken',
    'passwordResetExpires',
    '__v',
    'secret',
    'apiKey',
    'api_key'
  ];

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveFieldNames.includes(key.toLowerCase())) {
      continue;
    }
    result[key] = redactSecrets(value, seen, depth + 1);
  }

  return result;
}
