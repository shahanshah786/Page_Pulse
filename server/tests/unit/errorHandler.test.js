'use strict';

const { errorHandler, notFoundHandler } = require('../../src/middlewares/errorHandler');
const { ValidationError } = require('../../src/utils/AppError');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  test('formats an AppError with its own status/code', () => {
    const req = { id: 'req-1', method: 'POST', originalUrl: '/api/audit', ip: '127.0.0.1' };
    const res = mockRes();
    const err = new ValidationError('bad input', [{ path: 'url', message: 'required' }]);

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'bad input',
        errorCode: 'VALIDATION_ERROR',
        requestId: 'req-1',
        details: [{ path: 'url', message: 'required' }],
      })
    );
  });

  test('formats an unknown error as a generic 500', () => {
    const req = { id: 'req-2', method: 'GET', originalUrl: '/api/health', ip: '127.0.0.1' };
    const res = mockRes();
    const err = new Error('boom');

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.errorCode).toBe('INTERNAL_SERVER_ERROR');
    expect(payload.requestId).toBe('req-2');
  });

  test('notFoundHandler passes a 404 AppError to next', () => {
    const req = { method: 'GET', originalUrl: '/nope' };
    const next = jest.fn();

    notFoundHandler(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(404);
    expect(err.errorCode).toBe('ROUTE_NOT_FOUND');
  });
});
