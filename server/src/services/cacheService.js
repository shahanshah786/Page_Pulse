'use strict';

const crypto = require('crypto');
const config = require('../config/env');
const { getCacheAdapter } = require('../cache');

function buildCacheKey(url) {
  const normalized = url.trim().toLowerCase();
  const hash = crypto.createHash('sha256').update(normalized).digest('hex');
  return `audit:${hash}`;
}

/**
 * Cache-aside helper: looks up a cached audit result for a URL, or
 * null if absent/expired. Writing back is a separate step so the
 * controller can decide whether a fresh audit succeeded before caching.
 */
async function getCachedAudit(url) {
  const adapter = getCacheAdapter();
  const key = buildCacheKey(url);
  const cached = await adapter.get(key);
  return cached || null;
}

async function setCachedAudit(url, result) {
  const adapter = getCacheAdapter();
  const key = buildCacheKey(url);
  await adapter.set(key, result, config.cache.ttlSeconds);
}

module.exports = { buildCacheKey, getCachedAudit, setCachedAudit };
