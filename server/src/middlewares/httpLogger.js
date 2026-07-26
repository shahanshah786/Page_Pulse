'use strict';

const pinoHttp = require('pino-http');
const logger = require('../config/logger');

/**
 * Structured request/response logging. Logs method, url, status,
 * latency, ip and the correlation id for every request.
 */
const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.id,
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} completed`,
  customErrorMessage: (req, res, err) => `${req.method} ${req.url} failed: ${err.message}`,
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        ip: req.raw?.ip,
      };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
  },
});

module.exports = httpLogger;
