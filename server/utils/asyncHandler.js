module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('Error:', error);
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
