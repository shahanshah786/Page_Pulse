'use strict';

const path = require('path');

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({ path: path.resolve(__dirname, '../../', envFile) });

/**
 * Centralized, validated environment configuration.
 * Every other module reads config from here instead of
 * touching process.env directly (single source of truth).
 */
const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  port: parseInt(process.env.PORT, 10) || 5000,

  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim()),

  redisUrl: process.env.REDIS_URL || '',

  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS, 10) || 300,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 20,
  },

  audit: {
    timeoutMs: parseInt(process.env.AUDIT_TIMEOUT_MS, 10) || 5000,
    maxConcurrency: parseInt(process.env.AUDIT_MAX_CONCURRENCY, 10) || 10,
    maxRedirects: parseInt(process.env.AUDIT_MAX_REDIRECTS, 10) || 5,
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

module.exports = config;
