// Runs after all routes. If no route matched the request,
// this creates a normal 404 error and sends it to the global error handler.
function notFoundHandler(req, res, next) {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
}

// Final error middleware. Every error from controllers, services,
// asyncHandler, or notFoundHandler ends here and becomes one JSON response.
function errorHandler(error, req, res, next) {
    const statusCode = error.statusCode || error.status || 500;
    const response = {
        success: false,
        message: statusCode === 500 ? "Internal server error" : error.message,
    };

    // Stack traces are useful locally, but should not be exposed in production.
    if (process.env.NODE_ENV === "development") {
        response.stack = error.stack;
    }

    console.error(error);
    res.status(statusCode).json(response);
}

module.exports = { errorHandler, notFoundHandler };
