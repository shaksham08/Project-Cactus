const notFoundMiddleware = (request, response, next) => {
  const error = new Error(`Route not found: ${request.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorMiddleware = (error, request, response, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  response.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  });
};

module.exports = { notFoundMiddleware, errorMiddleware };