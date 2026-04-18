// error.middleware.js
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Server xətası',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { errorHandler, AppError };
