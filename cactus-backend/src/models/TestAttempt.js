const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    selectedOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    correctOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    incorrectAnswers: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TestAttempt', testAttemptSchema);