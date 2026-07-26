'use strict';

const request = require('supertest');
const createApp = require('../../src/app');

const app = createApp();

describe('GET /api/health', () => {
  test('returns 200 with service status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ok');
    expect(res.body.cache).toBeDefined();
    expect(res.body.cache.adapter).toBe('memory');
    expect(typeof res.body.uptimeSeconds).toBe('number');
  });
});

describe('GET /', () => {
  test('returns a friendly root message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
