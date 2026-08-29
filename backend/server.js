const app = require('./src/app');
const env = require('./src/config/env');
const connectDB = require('./src/config/db');

const PORT = env.port || 5000;

// Start server after connecting to DB
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${PORT}`);
  });
};

startServer();
