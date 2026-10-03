import 'dotenv/config';
import { createServer } from 'http';
import { App } from './app';
import { connectDatabase } from './config/database';
import Logger from './utils/logger.service';
import SchedulerService from './services/scheduler.service';
import AdminSeedService from './services/admin-seed.service';
import env from './utils/validate-env';

const app = new App();
const port = env.PORT;

const httpServer = createServer(app.express);

(async () => {
  try {
    await connectDatabase();
    Logger.info('PostgreSQL connected, ready to serve requests.');

    // Initialize scheduled tasks
    SchedulerService.initializeSchedules();

    // Initialize Admin Seed & verification
    await AdminSeedService.seedInitialData();

  } catch (err) {
    Logger.error('Failed to connect to PostgreSQL database:', err);
    process.exit(1);
  }

  httpServer.listen(port, () => {
    Logger.info(`Server is running on port ${port}... 🚀🚀`);
  });
})();
