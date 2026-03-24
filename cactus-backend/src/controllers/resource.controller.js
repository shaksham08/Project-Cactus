const Resource = require('../models/Resource');
const asyncHandler = require('../utils/async-handler');
const ApiError = require('../utils/api-error');

const listResources = asyncHandler(async (request, response) => {
  const resources = await Resource.find({ user: request.user._id }).sort({ createdAt: -1 });

  response.status(200).json({
    success: true,
    data: resources,
  });
});

const createResource = asyncHandler(async (request, response) => {
  const resource = await Resource.create({
    ...request.body,
    user: request.user._id,
  });

  response.status(201).json({
    success: true,
    data: resource,
  });
});

const updateResource = asyncHandler(async (request, response) => {
  const resource = await Resource.findOneAndUpdate(
    { _id: request.params.resourceId, user: request.user._id },
    request.body,
    { new: true, runValidators: true }
  );

  if (!resource) {
    throw new ApiError(404, 'Resource not found.');
  }

  response.status(200).json({
    success: true,
    data: resource,
  });
});

const deleteResource = asyncHandler(async (request, response) => {
  const resource = await Resource.findOneAndDelete({
    _id: request.params.resourceId,
    user: request.user._id,
  });

  if (!resource) {
    throw new ApiError(404, 'Resource not found.');
  }

  response.status(200).json({
    success: true,
    message: 'Resource deleted successfully.',
  });
});

module.exports = { listResources, createResource, updateResource, deleteResource };