'use strict';

const { Router } = require('express');
const { createAudit } = require('../controllers/auditController');
const { validateBody } = require('../middlewares/validate');
const { auditRequestSchema } = require('../validators/auditValidator');
const apiRateLimiter = require('../middlewares/rateLimiter');

const router = Router();

router.post('/', apiRateLimiter, validateBody(auditRequestSchema), createAudit);

module.exports = router;
