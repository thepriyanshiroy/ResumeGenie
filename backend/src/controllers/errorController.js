const AppError = require('../utils/appError');
const logger = require('../utils/logger');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : '';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid authentication token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your authentication token has expired! Please log in again.', 401);

/**
 * Strips internal secrets and keys from error messages before sending to client.
 */
function sanitizeErrorMessage(msg) {
  if (!msg || typeof msg !== 'string') return 'An error occurred';
  const secrets = [
    process.env.GEMINI_API_KEY,
    process.env.JWT_SECRET,
    process.env.BREVO_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
    process.env.DATABASE_PASSWORD,
    process.env.EMAIL_PASSWORD
  ].filter(s => typeof s === 'string' && s.length > 5);

  let clean = msg;
  for (const s of secrets) {
    clean = clean.split(s).join('[REDACTED]');
  }
  return clean;
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log detailed error on the server side only (not sent to client)
  logger.error(`${err.name || 'Error'}: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.stack
  });

  let error = { ...err };
  error.name = err.name;
  error.message = err.message;
  error.statusCode = err.statusCode;
  error.status = err.status;
  error.isOperational = err.isOperational;

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const isProduction = process.env.NODE_ENV === 'production';

  // For operational errors, send sanitized message to client
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: sanitizeErrorMessage(error.message)
    });
  }

  // For non-operational / unknown programming errors, do NOT leak internal error details
  if (isProduction) {
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong on the server! Please try again later.'
    });
  }

  // In development, send safe diagnostic message without internal stack/secrets
  return res.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: sanitizeErrorMessage(error.message)
  });
};
