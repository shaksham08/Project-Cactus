const Todo = require('../models/Todo');
const asyncHandler = require('../utils/async-handler');
const ApiError = require('../utils/api-error');

const listTodos = asyncHandler(async (request, response) => {
  const todos = await Todo.find({ user: request.user._id }).sort({ createdAt: -1 });

  response.status(200).json({
    success: true,
    data: todos,
  });
});

const createTodo = asyncHandler(async (request, response) => {
  const payload = {
    ...request.body,
    user: request.user._id,
  };

  if (payload.status === 'completed' && !payload.completedAt) {
    payload.completedAt = new Date();
  }

  const todo = await Todo.create(payload);

  response.status(201).json({
    success: true,
    data: todo,
  });
});

const updateTodo = asyncHandler(async (request, response) => {
  const payload = { ...request.body };

  if (payload.status === 'completed') {
    payload.completedAt = payload.completedAt || new Date();
  }

  if (payload.status && payload.status !== 'completed') {
    payload.completedAt = null;
  }

  const todo = await Todo.findOneAndUpdate(
    { _id: request.params.todoId, user: request.user._id },
    payload,
    { new: true, runValidators: true }
  );

  if (!todo) {
    throw new ApiError(404, 'Todo not found.');
  }

  response.status(200).json({
    success: true,
    data: todo,
  });
});

const deleteTodo = asyncHandler(async (request, response) => {
  const todo = await Todo.findOneAndDelete({ _id: request.params.todoId, user: request.user._id });

  if (!todo) {
    throw new ApiError(404, 'Todo not found.');
  }

  response.status(200).json({
    success: true,
    message: 'Todo deleted successfully.',
  });
});

module.exports = { listTodos, createTodo, updateTodo, deleteTodo };