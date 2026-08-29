const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const env = require('./config/env');
const { apiLimiter, loginLimiter } = require('./middlewares/rateLimiter');
const { auditContextMiddleware } = require('./middlewares/auditContext');

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const app = express();

app.set('trust proxy', 1); // Respect X-Forwarded-For for rate limiting

// Middleware
app.use(helmet());

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || env.allowedOrigins.includes('*') || env.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express 5 compatible mongo sanitization
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.query) mongoSanitize.sanitize(req.query);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

// Rate Limiting
if (!process.env.JEST_WORKER_ID || process.env.TEST_RATE_LIMIT === 'true') {
  app.use(apiLimiter);
  app.use('/api/v1/academic-master/auth/login', loginLimiter);
}

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global Audit Context
app.use(auditContextMiddleware);

// Apply API Limiter only to write methods (POST, PUT, PATCH, DELETE)
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return apiLimiter(req, res, next);
  }
  next();
});

// Swagger Documentation (available in all environments for testing, or restrict if needed)
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// For dev environments, we make docs public. In prod, this could be protected via auth middleware.
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DOCS === 'true') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Routes
app.use('/api/v1', routes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
