const rateLimit = require('express-rate-limit');

// Strict limiter for authentication routes (e.g. 5 attempts per 15 minutes)
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => process.env.JEST_WORKER_ID !== undefined && process.env.TEST_RATE_LIMIT !== 'true'
});

// General limiter for write routes (e.g. 100 attempts per 15 minutes)
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: { success: false, message: 'Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => process.env.JEST_WORKER_ID !== undefined && process.env.TEST_RATE_LIMIT !== 'true'
});
