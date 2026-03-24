const express = require('express');

const {
  listTests,
  createTest,
  getTestById,
  updateTest,
  deleteTest,
  submitTest,
  listAttempts,
  getLeaderboard,
} = require('../controllers/test.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createTestValidator, updateTestValidator, submitTestValidator } = require('../validators/test.validator');

const router = express.Router();

router.use(requireAuth);

router.get('/attempts/history', listAttempts);
router.get('/:testId/leaderboard', getLeaderboard);
router.get('/', listTests);
router.post('/', createTestValidator, validate, createTest);
router.get('/:testId', getTestById);
router.patch('/:testId', updateTestValidator, validate, updateTest);
router.delete('/:testId', deleteTest);
router.post('/:testId/submit', submitTestValidator, validate, submitTest);

module.exports = router;