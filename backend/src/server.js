require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Connect to database in background
  connectDB().catch((error) => {
    console.warn(`⚠️ Warning: Database connection error: ${error.message}`);
  });
};

startServer();
