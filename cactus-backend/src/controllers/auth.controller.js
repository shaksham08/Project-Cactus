const User = require('../models/User');
const asyncHandler = require('../utils/async-handler');
const ApiError = require('../utils/api-error');
const generateToken = require('../utils/token');

const buildAuthResponse = (user) => ({
  success: true,
  data: {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
    },
    token: generateToken(user._id.toString()),
  },
});

const register = asyncHandler(async (request, response) => {
  const { fullName, email, password } = request.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const user = await User.create({ fullName, email, password });

  response.status(201).json(buildAuthResponse(user));
});

const login = asyncHandler(async (request, response) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  response.status(200).json(buildAuthResponse(user));
});

const getProfile = asyncHandler(async (request, response) => {
  response.status(200).json({
    success: true,
    data: request.user,
  });
});

module.exports = { register, login, getProfile };