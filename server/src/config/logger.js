'use strict';

const pino = require('pino');
const config = require('./env');

const logger = pino({
  level: config.log.level,
  base: { service: 'page-pulse-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport:
    !config.isProduction && !config.isTest
      ? {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        }
      : undefined,
});

module.exports = logger;
