import path from 'path';

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_PATH: process.env.DB_PATH || path.resolve(process.cwd(), 'data', 'klimavani.sqlite'),
  COLLECTION_INTERVAL_MINUTES: process.env.COLLECTION_INTERVAL_MINUTES
    ? parseInt(process.env.COLLECTION_INTERVAL_MINUTES, 10)
    : 15,
  MAX_ARTICLES_PER_FEED: 20,
  REQUEST_TIMEOUT_MS: 9000,
  USER_AGENT: 'Klimavani-Climate-Collector/2.0 (+https://github.com/klimavani/klimavani)',
};
