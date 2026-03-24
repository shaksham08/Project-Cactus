const jwt = require('jsonwebtoken');

const User = require('../models/User');
const asyncHandler = require('../utils/async-handler');
const ApiError = require('../utils/api-error');

const requireAuth = asyncHandler(async (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authorization token is required.');
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new ApiError(500, 'JWT secret is not configured.');
  }

  try {
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw new ApiError(401, 'User linked to this token no longer exists.');
    }

    request.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token.');
  }
});

module.exports = { requireAuth };