'use strict';

const Redis = require('ioredis');
const logger = require('../config/logger');

/**
 * Thin wrapper around ioredis exposing the same interface as
 * MemoryCacheAdapter (get/set/del/isHealthy/close), so the caching
 * service can swap between them without any conditional logic
 * elsewhere in the codebase.
 */
class RedisCacheAdapter {
  constructor(url) {
    this.name = 'redis';
    this.client = new Redis(url, {
      maxRetriesPerRequest: 2,
      lazyConnect: false,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });

    this.client.on('error', (err) => {
      logger.error({ err }, 'Redis client error');
    });

    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });
  }

  async get(key) {
    const raw = await this.client.get(key);
    return raw ? JSON.parse(raw) : null;
  }

  async set(key, value, ttlSeconds) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key) {
    await this.client.del(key);
  }

  async isHealthy() {
    try {
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  async close() {
    await this.client.quit();
  }
}

module.exports = RedisCacheAdapter;
