const { body } = require('express-validator');

const createProgressValidator = [
  body('subject').trim().notEmpty().withMessage('Subject is required.'),
  body('topic').trim().notEmpty().withMessage('Topic is required.'),
  body('status')
    .optional()
    .isIn(['not-started', 'learning', 'revision', 'completed'])
    .withMessage('Invalid progress status.'),
  body('progressPercentage').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100.'),
  body('targetDate').optional({ nullable: true }).isISO8601().withMessage('targetDate must be a valid ISO date.'),
  body('lastReviewedAt').optional({ nullable: true }).isISO8601().withMessage('lastReviewedAt must be a valid ISO date.'),
];

const updateProgressValidator = [
  body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty.'),
  body('topic').optional().trim().notEmpty().withMessage('Topic cannot be empty.'),
  body('status')
    .optional()
    .isIn(['not-started', 'learning', 'revision', 'completed'])
    .withMessage('Invalid progress status.'),
  body('progressPercentage').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100.'),
  body('targetDate').optional({ nullable: true }).isISO8601().withMessage('targetDate must be a valid ISO date.'),
  body('lastReviewedAt').optional({ nullable: true }).isISO8601().withMessage('lastReviewedAt must be a valid ISO date.'),
];

module.exports = { createProgressValidator, updateProgressValidator };