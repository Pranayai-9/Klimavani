import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

function integerSetting(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}

export const ENV = {
  PORT: integerSetting('PORT', 5000, 1, 65535),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATA_DIR: path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data')),
  COLLECTION_INTERVAL_MINUTES: integerSetting('COLLECTION_INTERVAL_MINUTES', 15, 1, 1440),
  MAX_ARTICLES_PER_FEED: integerSetting('MAX_ARTICLES_PER_FEED', 20, 1, 100),
  REQUEST_TIMEOUT_MS: integerSetting('REQUEST_TIMEOUT_MS', 9000, 1000, 60000),
  USER_AGENT: 'Klimavani-Climate-Collector/2.0 (+https://github.com/klimavani/klimavani)',
};
