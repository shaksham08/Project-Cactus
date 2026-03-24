const LearningProgress = require('../models/LearningProgress');
const asyncHandler = require('../utils/async-handler');
const ApiError = require('../utils/api-error');

const listProgress = asyncHandler(async (request, response) => {
  const items = await LearningProgress.find({ user: request.user._id }).sort({ updatedAt: -1 });

  response.status(200).json({
    success: true,
    data: items,
  });
});

const createProgress = asyncHandler(async (request, response) => {
  const item = await LearningProgress.create({
    ...request.body,
    user: request.user._id,
  });

  response.status(201).json({
    success: true,
    data: item,
  });
});

const updateProgress = asyncHandler(async (request, response) => {
  const item = await LearningProgress.findOneAndUpdate(
    { _id: request.params.progressId, user: request.user._id },
    request.body,
    { new: true, runValidators: true }
  );

  if (!item) {
    throw new ApiError(404, 'Learning progress item not found.');
  }

  response.status(200).json({
    success: true,
    data: item,
  });
});

const deleteProgress = asyncHandler(async (request, response) => {
  const item = await LearningProgress.findOneAndDelete({
    _id: request.params.progressId,
    user: request.user._id,
  });

  if (!item) {
    throw new ApiError(404, 'Learning progress item not found.');
  }

  response.status(200).json({
    success: true,
    message: 'Learning progress item deleted successfully.',
  });
});

module.exports = { listProgress, createProgress, updateProgress, deleteProgress };