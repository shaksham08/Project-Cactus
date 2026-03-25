const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const asyncHandler = require('../utils/async-handler');
const ApiError = require('../utils/api-error');

const sanitizeTest = (test, isOwner = false) => {
  const normalizedTest = test.toObject ? test.toObject() : test;

  if (isOwner) {
    return normalizedTest;
  }

  return {
    ...normalizedTest,
    questions: sanitizeQuestions(normalizedTest.questions || []),
  };
};

const sanitizeQuestions = (questions) =>
  questions.map((question) => ({
    _id: question._id,
    question: question.question,
    explanation: question.explanation,
    options: question.options.map((option) => ({
      _id: option._id,
      text: option.text,
    })),
  }));

const listTests = asyncHandler(async (request, response) => {
  const tests = await Test.find({
    $or: [{ isPublished: true }, { owner: request.user._id }],
  })
    .populate('owner', 'fullName email')
    .sort({ createdAt: -1 });

  response.status(200).json({
    success: true,
    data: tests.map((test) => {
      const isOwner = test.owner._id.toString() === request.user._id.toString();
      return sanitizeTest(test, isOwner);
    }),
  });
});

const createTest = asyncHandler(async (request, response) => {
  const test = await Test.create({
    ...request.body,
    owner: request.user._id,
  });

  response.status(201).json({
    success: true,
    data: test,
  });
});

const getTestById = asyncHandler(async (request, response) => {
  const test = await Test.findById(request.params.testId).populate('owner', 'fullName email');

  if (!test) {
    throw new ApiError(404, 'Test not found.');
  }

  const isOwner = test.owner._id.toString() === request.user._id.toString();

  if (!isOwner && !test.isPublished) {
    throw new ApiError(403, 'You do not have access to this test.');
  }

  response.status(200).json({
    success: true,
    data: sanitizeTest(test, isOwner),
  });
});

const updateTest = asyncHandler(async (request, response) => {
  const test = await Test.findOneAndUpdate(
    { _id: request.params.testId, owner: request.user._id },
    request.body,
    { new: true, runValidators: true }
  );

  if (!test) {
    throw new ApiError(404, 'Test not found or access denied.');
  }

  response.status(200).json({
    success: true,
    data: test,
  });
});

const deleteTest = asyncHandler(async (request, response) => {
  const test = await Test.findOneAndDelete({ _id: request.params.testId, owner: request.user._id });

  if (!test) {
    throw new ApiError(404, 'Test not found or access denied.');
  }

  response.status(200).json({
    success: true,
    message: 'Test deleted successfully.',
  });
});

const submitTest = asyncHandler(async (request, response) => {
  const { answers = [] } = request.body;
  const test = await Test.findById(request.params.testId);

  if (!test) {
    throw new ApiError(404, 'Test not found.');
  }

  const isOwner = test.owner.toString() === request.user._id.toString();
  if (!isOwner && !test.isPublished) {
    throw new ApiError(403, 'You do not have access to submit this test.');
  }

  const answerMap = new Map(answers.map((answer) => [String(answer.questionId), String(answer.optionId)]));

  const result = test.questions.map((question) => {
    const selectedOptionId = answerMap.get(String(question._id));
    const correctOption = question.options.find((option) => option.isCorrect);
    const isCorrect = correctOption && String(correctOption._id) === selectedOptionId;

    return {
      questionId: question._id,
      selectedOptionId: selectedOptionId || null,
      correctOptionId: correctOption ? correctOption._id : null,
      isCorrect,
      explanation: question.explanation,
    };
  });

  const correctAnswers = result.filter((item) => item.isCorrect).length;
  const score = Math.round((correctAnswers / test.questions.length) * 100);

  const attempt = await TestAttempt.create({
    user: request.user._id,
    test: test._id,
    totalQuestions: test.questions.length,
    correctAnswers,
    incorrectAnswers: test.questions.length - correctAnswers,
    score,
    answers: result,
  });

  const attemptWithTest = await TestAttempt.findById(attempt._id).populate('test', 'title category difficulty');

  response.status(200).json({
    success: true,
    data: {
      attemptId: attempt._id,
      testId: test._id,
      totalQuestions: test.questions.length,
      correctAnswers,
      incorrectAnswers: test.questions.length - correctAnswers,
      score,
      result,
      attempt: attemptWithTest,
    },
  });
});

const listAttempts = asyncHandler(async (request, response) => {
  const attempts = await TestAttempt.find({ user: request.user._id })
    .populate('test', 'title category difficulty')
    .sort({ createdAt: -1 });

  response.status(200).json({
    success: true,
    data: attempts,
  });
});

const getAttemptById = asyncHandler(async (request, response) => {
  const attempt = await TestAttempt.findById(request.params.attemptId)
    .populate('user', 'fullName email')
    .populate('test');

  if (!attempt) {
    throw new ApiError(404, 'Attempt not found.');
  }

  const attemptUserId = attempt.user?._id?.toString();
  const testOwnerId = attempt.test?.owner?.toString();
  const requesterId = request.user._id.toString();
  const isAttemptOwner = attemptUserId === requesterId;
  const isTestOwner = testOwnerId === requesterId;

  if (!isAttemptOwner && !isTestOwner) {
    throw new ApiError(403, 'You do not have access to this attempt.');
  }

  const answerMap = new Map(
    (attempt.answers || []).map((answer) => [
      String(answer.questionId),
      answer,
    ])
  );

  const review = (attempt.test?.questions || []).map((question, index) => {
    const questionId = String(question._id);
    const answer = answerMap.get(questionId);
    const selectedOptionId = answer?.selectedOptionId
      ? String(answer.selectedOptionId)
      : null;
    const correctOptionId = answer?.correctOptionId
      ? String(answer.correctOptionId)
      : null;

    const selectedOption = selectedOptionId
      ? question.options.find((option) => String(option._id) === selectedOptionId)
      : null;
    const correctOption = correctOptionId
      ? question.options.find((option) => String(option._id) === correctOptionId)
      : question.options.find((option) => option.isCorrect);

    return {
      questionNumber: index + 1,
      questionId,
      question: question.question,
      explanation: answer?.explanation || question.explanation || '',
      isCorrect: Boolean(answer?.isCorrect),
      selectedOptionId,
      correctOptionId: correctOption ? String(correctOption._id) : null,
      selectedOptionText: selectedOption?.text || null,
      correctOptionText: correctOption?.text || null,
      options: question.options.map((option) => ({
        _id: String(option._id),
        text: option.text,
      })),
    };
  });

  response.status(200).json({
    success: true,
    data: {
      attempt: {
        _id: attempt._id,
        createdAt: attempt.createdAt,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.incorrectAnswers,
        totalQuestions: attempt.totalQuestions,
      },
      test: {
        _id: attempt.test?._id,
        title: attempt.test?.title,
        category: attempt.test?.category,
        difficulty: attempt.test?.difficulty,
      },
      user: {
        _id: attempt.user?._id,
        fullName: attempt.user?.fullName,
        email: attempt.user?.email,
      },
      review,
    },
  });
});

const getLeaderboard = asyncHandler(async (request, response) => {
  const test = await Test.findById(request.params.testId).populate('owner', 'fullName email');

  if (!test) {
    throw new ApiError(404, 'Test not found.');
  }

  const isOwner = test.owner._id.toString() === request.user._id.toString();
  if (!isOwner && !test.isPublished) {
    throw new ApiError(403, 'You do not have access to this leaderboard.');
  }

  const attempts = await TestAttempt.find({ test: test._id })
    .populate('user', 'fullName email')
    .sort({ score: -1, createdAt: 1 });

  response.status(200).json({
    success: true,
    data: {
      test: {
        _id: test._id,
        title: test.title,
        category: test.category,
        difficulty: test.difficulty,
        isPublished: test.isPublished,
      },
      attempts: attempts.map((attempt, index) => ({
        rank: index + 1,
        _id: attempt._id,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.incorrectAnswers,
        totalQuestions: attempt.totalQuestions,
        createdAt: attempt.createdAt,
        user: attempt.user,
      })),
    },
  });
});

module.exports = {
  listTests,
  createTest,
  getTestById,
  updateTest,
  deleteTest,
  submitTest,
  listAttempts,
  getAttemptById,
  getLeaderboard,
};