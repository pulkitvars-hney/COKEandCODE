# URL Shortner

Node.js backend for creating short URLs and redirecting them back to the original URL.

## Current Stack

- Node.js
- Express
- MongoDB with Mongoose
- dotenv for environment variables
- nanoid for short code generation
- nodemon for local development

## Project Map

```text
URL_Shortner/
  backend/
    server.js                         # Starts the server and connects to MongoDB
    package.json                      # Backend dependencies and scripts
    planingroutes.txt                 # Rough route notes
    src/
      app.js                          # Express app setup and route mounting
      db/
        database.js                   # MongoDB connection
      routes/
        shortUrl.route.js             # API routes
      controllers/
        shorturl.controller.js        # Request/response handlers
      services/
        shorturlhelper.service.js     # Business logic for creating and finding URLs
      middlewares/
        errorHandler.js               # Central 404 and error response middleware
      utils/
        ApiError.js                   # Error class for HTTP status-aware errors
        asyncHandler.js               # Wraps async controllers and forwards errors
      models/
        models.js                     # Mongoose URL model
      utiles/
        nanoid.js                     # Local wrapper around the nanoid package
```

## Request Flow

### Create a short URL

```text
POST /api/create/check
  -> routes/shortUrl.route.js
  -> controllers/shorturl.controller.js
  -> services/shorturlhelper.service.js
  -> models/models.js
  -> MongoDB
```

Expected body:

```json
{
  "originalUrl": "https://example.com"
}
```

The response returns a generated short URL.

If `originalUrl` is missing, the controller throws an `ApiError` and the global error handler returns a `400` JSON response.

### Redirect a short URL

```text
GET /api/:shortUrl
  -> routes/shortUrl.route.js
  -> controllers/shorturl.controller.js
  -> services/shorturlhelper.service.js
  -> models/models.js
  -> MongoDB
  -> redirects to originalUrl
```

If the short code does not exist, the controller throws an `ApiError` and the global error handler returns a `404` JSON response.

## Error Handling

Async route handlers are wrapped with `asyncHandler`, so thrown errors and rejected promises are forwarded to Express automatically.

Application errors should use `ApiError(statusCode, message)` when the route can return a known client-facing status code. Unmatched routes go through `notFoundHandler`, and all errors finish in the global `errorHandler` middleware.

## Environment Variables

Create a `.env` file inside `backend/`.

```env
mongodb_key=your_mongodb_connection_string
APP_KEY=http://localhost:3000/api/
```

## Run Locally

From the backend folder:

```bash
cd backend
npm install
npm run dev
```

The server currently listens on port `3000`.

## Development Notes

- Prefer existing project dependencies and built-in Node.js/Express/Mongoose features before adding custom logic.
- Before installing a new package, check whether the project already has a dependency that solves the problem.
- Keep route handling in controllers and business/database logic in services.
- Keep database schema changes inside `src/models/`.
- Keep environment-specific values in `.env`, not directly in source files.
- Do not edit files inside `node_modules/`.

## Things To Discuss Next

- Add stricter validation for invalid `originalUrl` values.
- Add duplicate URL handling so the same long URL can reuse an existing short URL.
- Move the hard-coded port into an environment variable.
- Add tests for create and redirect behavior.
- Add a `.gitignore` for `node_modules` and `.env` if one is not already present.
