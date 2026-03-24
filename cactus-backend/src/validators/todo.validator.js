const { body } = require('express-validator');

const createTodoValidator = [
  body('title').trim().notEmpty().withMessage('Todo title is required.'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid todo status.'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid todo priority.'),
  body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid ISO date.'),
];

const updateTodoValidator = [
  body('title').optional().trim().notEmpty().withMessage('Todo title cannot be empty.'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid todo status.'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid todo priority.'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('dueDate must be a valid ISO date.'),
];

module.exports = { createTodoValidator, updateTodoValidator };