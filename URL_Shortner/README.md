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

- Signup and login using username/email and password
- HTTP-only access and refresh-token cookies
- Protected link creation, link listing, and link deletion
- Public redirects with atomic total-click tracking
- Per-click analytics: browser, operating system, device type, referrer, timestamp, and a hashed visitor identifier
- Optional country and city lookup through the `ipwho.is` GeoIP API; a GeoIP outage never prevents a redirect
- Authenticated analytics overview for each owned URL
- Validates HTTP/HTTPS URLs and reuses an existing matching URL for the same user
- Centralized JSON error handling

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

Example authenticated creation request:

```json
{ "originalUrl": "https://example.com/article" }
```

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

## Current status

Completed:

- Authentication, URL CRUD, ownership checks, and public redirects
- Total click tracking and detailed analytics event logging
- Analytics overview API

Remaining:

- Frontend analytics dashboard
- Automated backend tests
- Deployment configuration and production validation
- Redis caching (optional enhancement)
