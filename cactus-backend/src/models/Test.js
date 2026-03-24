const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: (value) => value.length >= 4,
        message: 'Each question requires at least four options.',
      },
    },
  },
  { _id: true }
);

questionSchema.path('options').validate(function validateCorrectOption(value) {
  const correctOptions = value.filter((option) => option.isCorrect === true);
  return correctOptions.length === 1;
}, 'Each question must have exactly one correct option.');

const testSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    durationInMinutes: {
      type: Number,
      default: 15,
      min: 1,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (value) => value.length >= 1,
        message: 'A test must contain at least one question.',
      },
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Test', testSchema);