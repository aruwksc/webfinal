const errorMiddleware = (err, req, res, next) => {
  console.error(' Error:', err.message);

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} is already taken` });
  }

  if (err.name === 'ValidationError') {
    const msgs = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ message: msgs });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
