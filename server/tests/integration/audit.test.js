'use strict';

const nock = require('nock');
const request = require('supertest');

// The SSRF guard does a real DNS lookup before every outbound fetch.
// Test domains here don't exist in real DNS, so we stub the lookup to
// resolve to a known-public IP -- nock still intercepts the actual
// HTTP call, this only unblocks the pre-flight hostname check.
jest.mock('dns', () => ({
  promises: {
    lookup: jest.fn().mockResolvedValue([{ address: '93.184.216.34', family: 4 }]),
  },
}));

const createApp = require('../../src/app');

const app = createApp();

const SAMPLE_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <title>Example Domain</title>
    <meta name="description" content="Example description for testing" />
    <link rel="canonical" href="https://example.com/" />
    <meta property="og:title" content="Example OG Title" />
    <meta property="og:description" content="Example OG description" />
    <meta name="robots" content="index, follow" />
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body><h1>Example</h1></body>
</html>
`;

describe('POST /api/audit', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  test('returns a full audit payload for a valid public URL', async () => {
    nock('https://example.com')
      .get('/')
      .reply(200, SAMPLE_HTML, {
        'Content-Type': 'text/html; charset=utf-8',
        Server: 'ECS',
        'Cache-Control': 'max-age=604800',
        'Strict-Transport-Security': 'max-age=63072000',
      });

    const res = await request(app)
      .post('/api/audit')
      .send({ url: 'https://example.com' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cached).toBe(false);
    expect(res.body.data.statusCode).toBe(200);
    expect(res.body.data.https).toBe(true);
    expect(res.body.data.seo.title).toBe('Example Domain');
    expect(res.body.data.seo.metaDescription).toBe('Example description for testing');
    expect(res.body.data.seo.openGraph.title).toBe('Example OG Title');
    expect(res.body.data.hsts).toContain('max-age');
  });

  test('serves a cached response on the second request without hitting network', async () => {
    const scope = nock('https://cached-example.com')
      .get('/')
      .once()
      .reply(200, SAMPLE_HTML, { 'Content-Type': 'text/html' });

    const first = await request(app).post('/api/audit').send({ url: 'https://cached-example.com' });
    expect(first.status).toBe(200);
    expect(first.body.cached).toBe(false);

    const second = await request(app).post('/api/audit').send({ url: 'https://cached-example.com' });
    expect(second.status).toBe(200);
    expect(second.body.cached).toBe(true);
    expect(second.body.data.statusCode).toBe(200);

    expect(scope.isDone()).toBe(true); // network was only hit once
  });

  test('rejects an invalid URL with 400', async () => {
    const res = await request(app).post('/api/audit').send({ url: 'not-a-url' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    expect(res.body.requestId).toBeDefined();
  });

  test('rejects a missing url field with 400', async () => {
    const res = await request(app).post('/api/audit').send({});
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });

  test('blocks SSRF attempts against localhost with 403', async () => {
    const res = await request(app).post('/api/audit').send({ url: 'http://localhost:5000/secret' });

    expect(res.status).toBe(403);
    expect(res.body.errorCode).toBe('FORBIDDEN');
  });

  test('blocks SSRF attempts against private IP ranges with 403', async () => {
    const res = await request(app).post('/api/audit').send({ url: 'http://127.0.0.1/admin' });

    expect(res.status).toBe(403);
    expect(res.body.errorCode).toBe('FORBIDDEN');
  });

  test('follows redirects and reports redirect count', async () => {
    nock('https://redirect-source.com').get('/').reply(301, undefined, {
      Location: 'https://redirect-target.com/',
    });
    nock('https://redirect-target.com').get('/').reply(200, SAMPLE_HTML, {
      'Content-Type': 'text/html',
    });

    const res = await request(app).post('/api/audit').send({ url: 'https://redirect-source.com' });

    expect(res.status).toBe(200);
    expect(res.body.data.redirectCount).toBe(1);
    expect(res.body.data.finalUrl).toBe('https://redirect-target.com/');
  });

  test('returns 408 when the upstream request times out', async () => {
    nock('https://slow-example.com')
      .get('/')
      .delay(3000)
      .reply(200, SAMPLE_HTML);

    const res = await request(app).post('/api/audit').send({ url: 'https://slow-example.com' });

    expect(res.status).toBe(408);
    expect(res.body.errorCode).toBe('REQUEST_TIMEOUT');
  }, 10000);

  test('returns a well-formed 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('ROUTE_NOT_FOUND');
  });
});
