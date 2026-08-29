const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Academic Management System API',
      version: '1.0.0',
      description: 'API documentation for the AMS backend across Academic Master, Examination, Results & Backlogs, and Academic Support modules.',
    },
    servers: [
      {
        url: `http://localhost:${env.port || 5000}`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/modules/*/routes/*.js',
    './src/routes/*.js',
    './src/routes/index.js'
  ], // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
