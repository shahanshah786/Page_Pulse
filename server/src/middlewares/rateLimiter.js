'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config/env');

/**
 * Per-IP rate limiter. Returns the same JSON error contract as the
 * centralized error handler so clients only ever deal with one shape.
 */
const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please slow down and try again shortly.',
      errorCode: 'RATE_LIMIT_EXCEEDED',
      requestId: req.id,
    });
  },
});

module.exports = apiRateLimiter;
