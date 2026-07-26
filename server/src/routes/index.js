'use strict';

const { Router } = require('express');
const auditRoutes = require('./auditRoutes');
const healthRoutes = require('./healthRoutes');

const router = Router();

router.use('/audit', auditRoutes);
router.use('/health', healthRoutes);

module.exports = router;
