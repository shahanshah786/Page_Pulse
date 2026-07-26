'use strict';

const config = require('../config/env');
const logger = require('../config/logger');
const MemoryCacheAdapter = require('./MemoryCacheAdapter');

let adapter;

/**
 * Lazily builds the cache adapter. Redis is used when REDIS_URL is
 * configured; otherwise we transparently fall back to the in-memory
 * adapter so local dev / low-tier deployments still work.
 */
function getCacheAdapter() {
  if (adapter) return adapter;

  if (config.redisUrl && !config.isTest) {
    try {
      // eslint-disable-next-line global-require
      const RedisCacheAdapter = require('./RedisCacheAdapter');
      adapter = new RedisCacheAdapter(config.redisUrl);
      logger.info('Cache adapter: redis');
      return adapter;
    } catch (err) {
      logger.warn({ err }, 'Failed to initialize Redis, falling back to in-memory cache');
    }
  }

  adapter = new MemoryCacheAdapter();
  logger.info('Cache adapter: memory');
  return adapter;
}

module.exports = { getCacheAdapter };
