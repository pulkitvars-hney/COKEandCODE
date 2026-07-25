# URL Shortener

A simple backend API for creating short URLs and redirecting users back to the original links.

This project is being built with Node.js, Express, MongoDB, and Mongoose. It currently provides URL creation, redirection, click tracking, centralized error handling, and user authentication endpoints.

## Project Status

This project is currently in development.

Completed so far:

- Basic Express server setup
- MongoDB connection with Mongoose
- URL model for storing original URLs and short codes
- Short URL generation using `nanoid`
- API endpoint to create a short URL
- API endpoint to redirect a short URL
- Click count increment on redirect
- Centralized error handling middleware
- 404 handling for unknown routes
- User signup with password hashing using `bcrypt`
- Login with access and refresh JWTs stored in HTTP-only cookies
- JWT verification middleware for protected requests
- Protected endpoint to retrieve the signed-in user's profile

Still planned:

- Stronger validation for invalid URLs
- Duplicate URL handling
- Environment-based server port
- Tests for create and redirect behavior
- Refresh-token rotation and logout
- Frontend or API documentation page

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv
- nanoid
- nodemon
- bcrypt
- jsonwebtoken
- cookie-parser

## Folder Structure

```text
URL_Shortner/
  backend/
    server.js
    package.json
    src/
      app.js
      db/
        database.js
      routes/
        auth.routes.js
        shortUrl.route.js
      controllers/
        auth.controllers.js
        shorturl.controller.js
      services/
        auth.services.js
        login.service.js
        shorturlhelper.service.js
      DAo/
        saveurl.js
        user.dao.js
      models/
        models.js
        user.model.js
      middlewares/
        auth.middleware.js
        errorHandler.js
      utils/
        ApiError.js
        asyncHandler.js
      utiles/
        nanoid.js
```

## API Endpoints

### Create Short URL

```http
POST /api/create/check
```

Request body:

```json
{
  "originalUrl": "https://example.com"
}
```

Example response:

```json
{
  "shortUrl": "http://localhost:3000/api/abc1234"
}
```

### Redirect Short URL

```http
GET /api/:shortUrl
```

Example:

```http
GET /api/abc1234
```

If the short code exists, the server redirects to the original URL and increments the click count.

### Sign Up

```http
POST /api/auth/signup
```

```json
{
  "username": "alex",
  "email": "alex@example.com",
  "password": "a-strong-password"
}
```

### Log In

```http
POST /api/auth/login
```

Use either a username or email address as `identifier`.

```json
{
  "identifier": "alex@example.com",
  "password": "a-strong-password"
}
```

On success, the server returns the user without sensitive fields and sets HTTP-only `accessToken` and `refreshToken` cookies.

### Get Current User (Protected)

```http
GET /api/auth/me
```

Send the `accessToken` cookie created at login, or include the token as a bearer token:

```http
Authorization: Bearer <access-token>
```

The JWT middleware verifies the token, confirms that the user still exists, and adds the sanitized user document to the request.

## Error Handling

The project uses centralized error handling.

- `ApiError` is used for known application errors like bad requests or missing URLs.
- `asyncHandler` forwards async controller errors to Express automatically.
- `notFoundHandler` handles unknown routes.
- `errorHandler` sends a consistent JSON error response.

Example error response:

```json
{
  "success": false,
  "message": "Short URL not found"
}
```

When `NODE_ENV=development`, the response can also include a stack trace for debugging.

## Environment Variables

Create a `.env` file inside `backend/`.

```env
mongodb_key=your_mongodb_connection_string
APP_KEY=http://localhost:3000/api/
ACCESS_TOKEN_SECRET=replace_with_a_long_random_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=replace_with_a_different_long_random_secret
REFRESH_TOKEN_EXPIRY=7d
NODE_ENV=development
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
- Add refresh-token rotation, logout, and authentication tests.
- Add a `.gitignore` for `node_modules` and `.env` if one is not already present.
