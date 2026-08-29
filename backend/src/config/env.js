require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-management',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret',
  jwtExpiry: process.env.JWT_EXPIRY || '1h',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  lockoutDurationMs: parseInt(process.env.LOCKOUT_DURATION_MS, 10) || 15 * 60 * 1000,
  allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'],
  nodeEnv: process.env.NODE_ENV || 'development',
};

