export function errorMiddleware(err, _req, res, _next) {
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Erro interno',
    status
  });
}
