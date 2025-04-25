module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('Error:', error);

      // Check for Prisma's "Record not found" error
      if (error.code === 'P2025') {
        if (!res.headersSent) {
          return res.status(404).json({
            error: true,
            message: 'Resource not found',
          });
        }
      }

      // Handle other errors
      const status = error.status || 500;
      const message = error.message || 'Internal server error';

      if (!res.headersSent) {
        return res.status(status).json({ error: true, message });
      } else {
        next(error);
      }
    });
  };
};
