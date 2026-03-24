const Document = require('../models/Document');
const asyncHandler = require('../utils/async-handler');
const ApiError = require('../utils/api-error');

const listDocuments = asyncHandler(async (request, response) => {
  const documents = await Document.find({ user: request.user._id }).sort({ updatedAt: -1 });

  response.status(200).json({
    success: true,
    data: documents,
  });
});

const createDocument = asyncHandler(async (request, response) => {
  const document = await Document.create({
    ...request.body,
    user: request.user._id,
  });

  response.status(201).json({
    success: true,
    data: document,
  });
});

const updateDocument = asyncHandler(async (request, response) => {
  const payload = { ...request.body };

  if (!payload.lastOpenedAt) {
    payload.lastOpenedAt = new Date();
  }

  const document = await Document.findOneAndUpdate(
    { _id: request.params.documentId, user: request.user._id },
    payload,
    { new: true, runValidators: true }
  );

  if (!document) {
    throw new ApiError(404, 'Document not found.');
  }

  response.status(200).json({
    success: true,
    data: document,
  });
});

const deleteDocument = asyncHandler(async (request, response) => {
  const document = await Document.findOneAndDelete({
    _id: request.params.documentId,
    user: request.user._id,
  });

  if (!document) {
    throw new ApiError(404, 'Document not found.');
  }

  response.status(200).json({
    success: true,
    message: 'Document deleted successfully.',
  });
});

module.exports = { listDocuments, createDocument, updateDocument, deleteDocument };