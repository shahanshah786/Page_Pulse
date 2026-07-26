'use strict';

/**
 * A minimal drop-in replacement for the Redis adapter, used when
 * REDIS_URL is not configured (e.g. local dev without Docker, or
 * the free tier of a host with no managed Redis). Same interface,
 * so the rest of the app never needs to know which one is active.
 */
class MemoryCacheAdapter {
  constructor() {
    this.store = new Map();
    this.name = 'memory';
  }

  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key, value, ttlSeconds) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key) {
    this.store.delete(key);
  }

  async isHealthy() {
    return true;
  }

  async close() {
    this.store.clear();
  }
}

module.exports = MemoryCacheAdapter;
