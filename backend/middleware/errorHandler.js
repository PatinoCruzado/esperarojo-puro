function errorHandler(err, req, res, _next) {
  console.error('[Error]', err.message);

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? 'Error interno del servidor'
    : err.message;

  res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = { errorHandler };
