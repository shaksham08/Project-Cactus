const { body } = require('express-validator');

const createDocumentValidator = [
  body('title').trim().notEmpty().withMessage('Document title is required.'),
  body('language').optional().trim().notEmpty().withMessage('Document language cannot be empty.'),
];

const updateDocumentValidator = [
  body('title').optional().trim().notEmpty().withMessage('Document title cannot be empty.'),
  body('language').optional().trim().notEmpty().withMessage('Document language cannot be empty.'),
  body('lastOpenedAt').optional({ nullable: true }).isISO8601().withMessage('lastOpenedAt must be a valid ISO date.'),
];

module.exports = { createDocumentValidator, updateDocumentValidator };