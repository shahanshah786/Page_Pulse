'use strict';

const nock = require('nock');
const request = require('supertest');

jest.mock('dns', () => ({
  promises: {
    lookup: jest.fn().mockResolvedValue([{ address: '93.184.216.34', family: 4 }]),
  },
}));

jest.mock('../../src/services/cacheService', () => ({
  getCachedAudit: jest.fn().mockRejectedValue(new Error('ECONNREFUSED: redis down')),
  setCachedAudit: jest.fn().mockRejectedValue(new Error('ECONNREFUSED: redis down')),
}));

const createApp = require('../../src/app');

const app = createApp();

describe('Cache failure degradation', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  test('serves a live audit successfully even when the cache is completely down', async () => {
    nock('https://cache-down-example.com')
      .get('/')
      .reply(200, '<html><title>Still works</title></html>', { 'Content-Type': 'text/html' });

    const res = await request(app).post('/api/audit').send({ url: 'https://cache-down-example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cached).toBe(false);
    expect(res.body.data.seo.title).toBe('Still works');
  });
});
