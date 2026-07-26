'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Attaches a correlation ID to every request/response so a single
 * request can be traced across logs, error responses and (in a real
 * deployment) distributed tracing systems.
 */
function requestId(req, res, next) {
  const incoming = req.headers['x-request-id'];
  req.id = typeof incoming === 'string' && incoming.trim() ? incoming : uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
}

module.exports = requestId;
