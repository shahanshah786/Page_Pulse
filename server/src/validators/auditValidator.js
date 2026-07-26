'use strict';

const { z } = require('zod');

/**
 * Validates the shape of an incoming audit request.
 * Only http/https protocols are permitted; anything else
 * (file://, ftp://, javascript:, data:, etc.) is rejected outright.
 */
const auditRequestSchema = z.object({
  url: z
    .string({ required_error: 'url is required' })
    .trim()
    .min(1, 'url cannot be empty')
    .max(2048, 'url is too long')
    .refine(
      (value) => {
        try {
          const parsed = new URL(value);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: 'url must be a valid absolute http(s) URL' }
    ),
});

module.exports = { auditRequestSchema };
