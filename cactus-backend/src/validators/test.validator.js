const { body } = require('express-validator');

const validateCorrectOption = (options) => {
  const correctOptions = options.filter((option) => option && option.isCorrect === true);
  return correctOptions.length === 1;
};

const questionRules = [
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required.'),
  body('questions.*.question').trim().notEmpty().withMessage('Question text is required.'),
  body('questions.*.options').isArray({ min: 4 }).withMessage('Each question needs at least four options.'),
  body('questions.*.options.*.text').trim().notEmpty().withMessage('Option text is required.'),
  body('questions.*.options').custom(validateCorrectOption).withMessage('Each question must have exactly one correct option.'),
];

const createTestValidator = [
  body('title').trim().notEmpty().withMessage('Test title is required.'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty is invalid.'),
  body('durationInMinutes').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 minute.'),
  ...questionRules,
];

const updateTestValidator = [
  body('title').optional().trim().notEmpty().withMessage('Test title cannot be empty.'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty is invalid.'),
  body('durationInMinutes').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 minute.'),
  body('questions').optional().isArray({ min: 1 }).withMessage('At least one question is required.'),
  body('questions.*.question').optional().trim().notEmpty().withMessage('Question text is required.'),
  body('questions.*.options').optional().isArray({ min: 4 }).withMessage('Each question needs at least four options.'),
  body('questions.*.options.*.text').optional().trim().notEmpty().withMessage('Option text is required.'),
  body('questions.*.options')
    .optional()
    .custom(validateCorrectOption)
    .withMessage('Each question must have exactly one correct option.'),
];

const submitTestValidator = [
  body('answers').isArray().withMessage('Answers must be an array.'),
  body('answers.*.questionId').notEmpty().withMessage('questionId is required.'),
  body('answers.*.optionId').notEmpty().withMessage('optionId is required.'),
];

module.exports = { createTestValidator, updateTestValidator, submitTestValidator };