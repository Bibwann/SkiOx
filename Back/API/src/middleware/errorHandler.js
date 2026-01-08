module.exports = function errorHandler(err, req, res, next) {
  // Log server-side error
  console.error(err && err.stack ? err.stack : err);

  const status = err && err.status ? err.status : 500;
  const message = err && err.message ? err.message : 'Internal Server Error';

  res.status(status).json({ error: message });
};
