import { Sequelize } from 'sequelize';
import Logger from '../utils/logger.service';

const connectionUri = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rtut_dev';

// Automatically detect if SSL is required (e.g. Render, Supabase, Neon, AWS RDS, or production)
const isProduction =
    process.env.NODE_ENV === 'production' ||
    connectionUri.includes('render.com') ||
    connectionUri.includes('amazonaws.com') ||
    connectionUri.includes('supabase') ||
    connectionUri.includes('neon.tech') ||
    process.env.DB_SSL === 'true';

export const sequelize = new Sequelize(connectionUri, {
    dialect: 'postgres',
    logging: (msg: string) => {
        if (process.env.DEBUG_SQL === 'true') {
            Logger.debug(msg);
        }
    },
    dialectOptions: isProduction
        ? {
              ssl: {
                  require: true,
                  rejectUnauthorized: false,
              },
          }
        : {},
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

export const connectDatabase = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        Logger.info('PostgreSQL connection established successfully.');

        // Import associations to ensure all foreign keys are registered before sync
        const { initAssociations } = await import('../models/index.js');
        initAssociations();

        // Sync all models with PostgreSQL database
        await sequelize.sync();
        Logger.info('PostgreSQL database synchronized with models.');
    } catch (err) {
        Logger.error('Failed to connect to PostgreSQL database:', err);
        throw err;
    }
};

export default sequelize;
