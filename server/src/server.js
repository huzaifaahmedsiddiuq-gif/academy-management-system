import app from './app.js';
import { config } from './config/index.js';
import db from './database/index.js';

const PORT = config.port;

const startServer = async () => {
  try {
    console.log('\n========================================================');
    console.log('       🏫 ACADEMY MANAGEMENT SYSTEM - BACKEND API       ');
    console.log('========================================================');
    console.log(`Active Database Provider: [${db.getProvider().toUpperCase()}]`);

    // Verify DB Connection
    await db.checkDatabaseConnection();

    app.listen(PORT, () => {
      console.log(`🚀 Academy Server listening on: http://localhost:${PORT}`);
      console.log(`📡 Health Check endpoint:       http://localhost:${PORT}/api/health`);
      console.log('========================================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
};

startServer();
