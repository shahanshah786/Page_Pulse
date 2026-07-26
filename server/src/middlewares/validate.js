'use strict';

const { ValidationError } = require('../utils/AppError');

/**
 * Generic validation middleware. Accepts a Zod schema and validates
 * req.body against it, attaching the parsed/sanitized result back
 * onto req.body so downstream handlers only ever see clean data.
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ValidationError('Request validation failed', details));
    }

    req.body = result.data;
    next();
  };
}

module.exports = { validateBody };
