'use strict';

const ConcurrencyLimiter = require('../../src/utils/concurrencyLimiter');

describe('ConcurrencyLimiter', () => {
  test('runs tasks up to the limit concurrently', async () => {
    const limiter = new ConcurrencyLimiter(2);
    let active = 0;
    let maxActive = 0;

    const task = () =>
      limiter.run(async () => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        await new Promise((resolve) => setTimeout(resolve, 20));
        active -= 1;
        return 'done';
      });

    const results = await Promise.all([task(), task(), task(), task()]);

    expect(results).toEqual(['done', 'done', 'done', 'done']);
    expect(maxActive).toBeLessThanOrEqual(2);
  });

  test('queues tasks beyond the limit and eventually runs them', async () => {
    const limiter = new ConcurrencyLimiter(1);
    const order = [];

    const makeTask = (id) =>
      limiter.run(async () => {
        order.push(`start-${id}`);
        await new Promise((resolve) => setTimeout(resolve, 10));
        order.push(`end-${id}`);
      });

    await Promise.all([makeTask(1), makeTask(2)]);

    // With concurrency 1, task 1 must fully finish before task 2 starts.
    expect(order).toEqual(['start-1', 'end-1', 'start-2', 'end-2']);
  });
});
