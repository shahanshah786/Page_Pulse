'use strict';

const MemoryCacheAdapter = require('../../src/cache/MemoryCacheAdapter');

describe('MemoryCacheAdapter', () => {
  let cache;

  beforeEach(() => {
    cache = new MemoryCacheAdapter();
  });

  test('returns null for missing key', async () => {
    expect(await cache.get('missing')).toBeNull();
  });

  test('stores and retrieves a value', async () => {
    await cache.set('key', { hello: 'world' }, 60);
    expect(await cache.get('key')).toEqual({ hello: 'world' });
  });

  test('expires values after ttl', async () => {
    jest.useFakeTimers();
    await cache.set('key', 'value', 1); // 1 second TTL
    jest.advanceTimersByTime(1500);
    expect(await cache.get('key')).toBeNull();
    jest.useRealTimers();
  });

  test('del removes a key', async () => {
    await cache.set('key', 'value', 60);
    await cache.del('key');
    expect(await cache.get('key')).toBeNull();
  });

  test('isHealthy always resolves true', async () => {
    expect(await cache.isHealthy()).toBe(true);
  });
});
