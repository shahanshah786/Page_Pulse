'use strict';

const logger = require('../config/logger');
const { auditUrl } = require('../services/auditService');
const { getCachedAudit, setCachedAudit } = require('../services/cacheService');

/**
 * POST /api/audit
 * Validated req.body.url is guaranteed present at this point
 * (see validators/auditValidator.js + middlewares/validate.js).
 */
async function createAudit(req, res, next) {
  const { url } = req.body;

  try {
    let cached = null;
    try {
      cached = await getCachedAudit(url);
    } catch (cacheErr) {
      logger.warn({ requestId: req.id, url, err: cacheErr }, 'Cache read failed, treating as a miss');
    }

    if (cached) {
      logger.info({ requestId: req.id, url }, 'Audit cache hit');
      return res.status(200).json({
        success: true,
        cached: true,
        requestId: req.id,
        data: cached,
      });
    }

    const result = await auditUrl(url);

    try {
      await setCachedAudit(url, result);
    } catch (cacheErr) {
      logger.warn({ requestId: req.id, url, err: cacheErr }, 'Cache write failed, serving result uncached');
    }

    logger.info({ requestId: req.id, url, statusCode: result.statusCode }, 'Audit completed');

    return res.status(200).json({
      success: true,
      cached: false,
      requestId: req.id,
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createAudit };
