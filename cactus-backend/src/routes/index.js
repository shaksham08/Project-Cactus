const express = require('express');

const authRoutes = require('./auth.routes');
const testRoutes = require('./test.routes');
const todoRoutes = require('./todo.routes');
const progressRoutes = require('./progress.routes');
const documentRoutes = require('./document.routes');
const resourceRoutes = require('./resource.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tests', testRoutes);
router.use('/todos', todoRoutes);
router.use('/progress', progressRoutes);
router.use('/documents', documentRoutes);
router.use('/resources', resourceRoutes);

module.exports = router;