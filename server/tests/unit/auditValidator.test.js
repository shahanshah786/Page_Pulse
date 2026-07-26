'use strict';

const { auditRequestSchema } = require('../../src/validators/auditValidator');

describe('auditRequestSchema', () => {
  test('accepts a valid https URL', () => {
    const result = auditRequestSchema.safeParse({ url: 'https://example.com' });
    expect(result.success).toBe(true);
  });

  test('accepts a valid http URL', () => {
    const result = auditRequestSchema.safeParse({ url: 'http://example.com/path?q=1' });
    expect(result.success).toBe(true);
  });

  test('rejects missing url', () => {
    const result = auditRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  test('rejects empty string url', () => {
    const result = auditRequestSchema.safeParse({ url: '' });
    expect(result.success).toBe(false);
  });

  test('rejects malformed url', () => {
    const result = auditRequestSchema.safeParse({ url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  test('rejects non-http(s) protocols', () => {
    expect(auditRequestSchema.safeParse({ url: 'ftp://example.com' }).success).toBe(false);
    expect(auditRequestSchema.safeParse({ url: 'file:///etc/passwd' }).success).toBe(false);
    expect(auditRequestSchema.safeParse({ url: 'javascript:alert(1)' }).success).toBe(false);
  });

  test('rejects urls exceeding max length', () => {
    const longUrl = `https://example.com/${'a'.repeat(2100)}`;
    const result = auditRequestSchema.safeParse({ url: longUrl });
    expect(result.success).toBe(false);
  });
});
