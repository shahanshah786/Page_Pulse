'use strict';

const {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  TimeoutError,
  RateLimitError,
  InternalError,
} = require('../../src/utils/AppError');

describe('AppError family', () => {
  test('AppError sets statusCode, errorCode and isOperational', () => {
    const err = new AppError('custom', 418, 'IM_A_TEAPOT');
    expect(err.statusCode).toBe(418);
    expect(err.errorCode).toBe('IM_A_TEAPOT');
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(Error);
  });

  test('ValidationError defaults to 400', () => {
    const err = new ValidationError();
    expect(err.statusCode).toBe(400);
    expect(err.errorCode).toBe('VALIDATION_ERROR');
  });

  test('UnauthorizedError defaults to 401', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.errorCode).toBe('UNAUTHORIZED');
  });

  test('ForbiddenError defaults to 403', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.errorCode).toBe('FORBIDDEN');
  });

  test('NotFoundError defaults to 404', () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.errorCode).toBe('NOT_FOUND');
  });

  test('TimeoutError defaults to 408', () => {
    const err = new TimeoutError();
    expect(err.statusCode).toBe(408);
    expect(err.errorCode).toBe('REQUEST_TIMEOUT');
  });

  test('RateLimitError defaults to 429', () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.errorCode).toBe('RATE_LIMIT_EXCEEDED');
  });

  test('InternalError defaults to 500', () => {
    const err = new InternalError();
    expect(err.statusCode).toBe(500);
    expect(err.errorCode).toBe('INTERNAL_SERVER_ERROR');
  });
});
