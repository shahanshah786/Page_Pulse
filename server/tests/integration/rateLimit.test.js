'use strict';

const nock = require('nock');
const request = require('supertest');

// This file needs a much stricter limit than the rest of the suite,
// so we override the env vars and force a fresh module registry
// (config/env.js reads process.env once, at require time) before
// pulling in the app.
process.env.RATE_LIMIT_MAX = '3';
process.env.RATE_LIMIT_WINDOW_MS = '1000';

let createApp;
jest.isolateModules(() => {
  // eslint-disable-next-line global-require
  createApp = require('../../src/app');
});

const app = createApp();

// Strict limit configured above: 3 requests per 1000ms window.
describe('Rate limiting', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  test('allows requests under the limit and blocks once exceeded', async () => {
    nock('https://rate-limit-example.com').get('/').times(3).reply(200, '<html><title>ok</title></html>', {
      'Content-Type': 'text/html',
    });

    const responses = [];
    for (let i = 0; i < 4; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = await request(app).post('/api/audit').send({ url: 'https://rate-limit-example.com' });
      responses.push(res);
    }

    const statuses = responses.map((r) => r.status);
    const tooManyCount = statuses.filter((s) => s === 429).length;

    expect(tooManyCount).toBeGreaterThanOrEqual(1);

    const limited = responses.find((r) => r.status === 429);
    expect(limited.body.errorCode).toBe('RATE_LIMIT_EXCEEDED');
    expect(limited.body.success).toBe(false);
    expect(limited.body.requestId).toBeDefined();
  });
});
