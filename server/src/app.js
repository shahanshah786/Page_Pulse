'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const config = require('./config/env');
const requestId = require('./middlewares/requestId');
const httpLogger = require('./middlewares/httpLogger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

function createApp() {
  const app = express();

  // Correlation ID must be attached before anything logs.
  app.use(requestId);
  app.use(httpLogger);

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));

  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Page Pulse API is running',
      docs: '/api/health',
    });
  });

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
