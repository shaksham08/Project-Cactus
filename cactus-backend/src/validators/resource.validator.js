const { body } = require('express-validator');

const resourceTypes = ['youtube', 'blog', 'article', 'course', 'documentation', 'other'];

const createResourceValidator = [
  body('title').trim().notEmpty().withMessage('Resource title is required.'),
  body('url').isURL().withMessage('A valid URL is required.'),
  body('type').optional().isIn(resourceTypes).withMessage('Invalid resource type.'),
];

const updateResourceValidator = [
  body('title').optional().trim().notEmpty().withMessage('Resource title cannot be empty.'),
  body('url').optional().isURL().withMessage('A valid URL is required.'),
  body('type').optional().isIn(resourceTypes).withMessage('Invalid resource type.'),
];

module.exports = { createResourceValidator, updateResourceValidator };