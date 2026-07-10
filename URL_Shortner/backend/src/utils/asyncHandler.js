// Wraps async route controllers so any thrown error or rejected promise
// is passed to Express using next(), instead of needing try/catch in every route.
const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

module.exports = asyncHandler;
