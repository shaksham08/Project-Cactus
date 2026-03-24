const express = require('express');

const {
  listProgress,
  createProgress,
  updateProgress,
  deleteProgress,
} = require('../controllers/progress.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createProgressValidator, updateProgressValidator } = require('../validators/progress.validator');

const router = express.Router();

router.use(requireAuth);

router.get('/', listProgress);
router.post('/', createProgressValidator, validate, createProgress);
router.patch('/:progressId', updateProgressValidator, validate, updateProgress);
router.delete('/:progressId', deleteProgress);

module.exports = router;