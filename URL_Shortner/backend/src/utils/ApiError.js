// Use this class when the application knows which HTTP status code
// should be returned, for example 400 for bad input or 404 for missing data.
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

module.exports = ApiError;
