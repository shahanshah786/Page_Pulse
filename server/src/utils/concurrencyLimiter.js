'use strict';

/**
 * Small semaphore used to cap how many audits can run at the same
 * time, protecting the process from being overwhelmed by a burst
 * of slow upstream requests (each audit makes an outbound HTTP call).
 */
class ConcurrencyLimiter {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent;
    this.active = 0;
    this.queue = [];
  }

  async run(task) {
    if (this.active >= this.maxConcurrent) {
      await new Promise((resolve) => this.queue.push(resolve));
    }

    this.active += 1;
    try {
      return await task();
    } finally {
      this.active -= 1;
      const next = this.queue.shift();
      if (next) next();
    }
  }

  get pending() {
    return this.queue.length;
  }
}

module.exports = ConcurrencyLimiter;
