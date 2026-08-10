# Shortly — URL Shortener

Shortly is a full-stack URL shortener. Registered users can create, copy, view, and delete their own short links. Anyone with a short link can open it and be redirected to the original destination. Each successful redirect records a click event for analytics.

## Architecture

```text
React + Vite client (port 5173)
  └─ development proxy: /api → Express API (port 3000)
       ├─ routes → controllers → services → DAOs
       ├─ JWT authentication in HTTP-only cookies
       └─ Mongoose → MongoDB (User, Url, and analytics collections)
```

The React client uses React Query for session state, mutations, and the user's saved links. Express keeps HTTP handling in controllers, URL/auth business rules in services, and MongoDB access in DAOs.

## Features

- Signup with username, email, and password; login with email and password
- HTTP-only access and refresh-token cookies with unique-JTI rotation
- Protected link creation, link listing, and link deletion
- Public redirects with atomic total-click tracking
- Generated NanoID short codes or optional custom aliases
- Alias validation, reserved-name protection, and duplicate-alias detection
- Per-click analytics: browser, operating system, device type, referrer, timestamp, and a hashed visitor identifier
- Optional country and city lookup through the `ipwho.is` GeoIP API; a GeoIP outage never prevents a redirect
- Authenticated analytics overview for each owned URL
- Validates HTTP/HTTPS URLs, route IDs, analytics intervals, and result limits
- Centralized JSON error handling with ownership checks

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Log in and receive cookies |
| GET | `/api/auth/me` | Read the active session |
| POST | `/api/auth/logout` | End the active session |
| POST | `/api/auth/refresh-token` | Refresh access and refresh cookies |
| POST | `/api/url/create` | Create a short URL (authenticated) |
| GET | `/api/url/myurls` | List the current user's URLs (authenticated) |
| DELETE | `/api/url/:id` | Delete one of the current user's URLs (authenticated) |
| GET | `/api/:shortUrl` | Redirect a public short URL |
| GET | `/api/analytics/:urlId/overview?interval=day` | View analytics for an owned URL (authenticated) |
| GET | `/api/analytics/:urlId/recent?limit=20` | View recent clicks for an owned URL (authenticated) |

## API documentation

Start the backend and open `http://localhost:3000/api-docs` to view and try the Swagger UI documentation. Protected routes support JWT Bearer authentication through Swagger's **Authorize** button. Browser clients can continue using the existing HTTP-only authentication cookies.

Example authenticated creation request without a custom alias:

```json
{ "originalUrl": "https://example.com/article" }
```

Example authenticated creation request with a custom alias:

```json
{ "originalUrl": "https://example.com/article", "alias": "my-link" }
```

Aliases are optional, 3–30 characters long, and may contain letters, numbers, hyphens, and underscores. Reserved aliases such as `api`, `login`, `signup`, `auth`, `admin`, and `health` are rejected. If no alias is supplied, the server generates a unique seven-character NanoID.

The analytics overview accepts `day`, `week`, `month`, or `year` as its optional `interval`. It returns total clicks, unique and repeat visitor counts, a click timeline, and country/browser/device/OS breakdowns.

## Redirect and analytics flow

```text
GET /api/:shortUrl
  → find URL and atomically increment `clicks`
  → collect request and GeoIP metadata
  → create an analytics event
  → redirect to the original URL
```

Country and city will be empty during localhost testing because loopback IP addresses (`127.0.0.1` / `::1`) do not have a geographic location. Test with public traffic after deployment.

## Setup

1. Create `backend/.env` with a MongoDB connection string and JWT secrets.
2. Start the backend:

```bash
cd backend
npm install
npm run dev
```

3. In another terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite address displayed in the terminal (normally `http://localhost:5173`). The frontend forwards `/api` requests to the backend during development.

`PORT` defaults to `3000`; set it in `.env` when needed. Keep `APP_KEY` aligned with that public backend address, for example `http://localhost:3000/api/`.

## Backend tests

Run the complete backend API test suite from the `backend` directory:

```bash
npm test -- --silent
```

The suite uses an in-memory MongoDB instance and currently covers signup, login, logout, refresh-token rotation and invalidation, protected routes, URL creation/listing/deletion, custom and generated aliases, redirects, ownership checks, analytics overview/recent endpoints, and click recording.

## Current status

Completed:

- Authentication, URL CRUD, ownership checks, and public redirects
- URL creation and alias validation
- Refresh-token rotation with old-token reuse protection
- Logout invalidation for access and refresh sessions
- Total click tracking and detailed analytics event logging
- Analytics overview and recent-click APIs
- Automated backend API tests (47 tests passing)

Remaining:

- Frontend analytics dashboard
- CORS configuration for the production frontend
- Deployment configuration and production validation
- Deployed API verification with production MongoDB, JWT secrets, cookies, and redirects
- Redis caching (optional enhancement)
