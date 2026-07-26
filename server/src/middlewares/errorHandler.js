'use strict';

const logger = require('../config/logger');
const { AppError } = require('../utils/AppError');

/**
 * 404 handler for unmatched routes. Placed after all routes.
 */
function notFoundHandler(req, res, next) {
  const err = new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(err);
}

/**
 * Centralized error handler. Every error thrown or passed via next(err)
 * anywhere in the app ends up here and is formatted into a single,
 * predictable JSON contract.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const errorCode = isAppError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  const message = isAppError ? err.message : 'Something went wrong. Please try again later.';

  const logPayload = {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    errorCode,
    ip: req.ip,
  };

  if (statusCode >= 500) {
    logger.error({ ...logPayload, err }, 'Unhandled error while processing request');
  } else {
    logger.warn(logPayload, 'Request failed');
  }

  const body = {
    success: false,
    message,
    errorCode,
    requestId: req.id,
  };

  if (isAppError && err.details) {
    body.details = err.details;
  }

  res.status(statusCode).json(body);
}

module.exports = { notFoundHandler, errorHandler };
