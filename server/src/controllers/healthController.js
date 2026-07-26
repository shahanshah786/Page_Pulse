'use strict';

const { getCacheAdapter } = require('../cache');
const { limiter } = require('../services/auditService');

async function getHealth(req, res) {
  const adapter = getCacheAdapter();
  const cacheHealthy = await adapter.isHealthy();

  res.status(200).json({
    success: true,
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    cache: {
      adapter: adapter.name,
      healthy: cacheHealthy,
    },
    audit: {
      activeRequests: limiter.active,
      queuedRequests: limiter.pending,
    },
    timestamp: new Date().toISOString(),
  });
}

module.exports = { getHealth };
