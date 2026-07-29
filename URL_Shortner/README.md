# Shortly — URL Shortener

Shortly is a full-stack URL shortener. Registered users can create, copy, view, and delete their own short links. Anyone with a short link can open it and be redirected to the original destination.

## Architecture

```text
React + Vite client (port 5173)
  └─ development proxy: /api → Express API (port 3000)
       ├─ routes → controllers → services → DAOs
       ├─ JWT authentication in HTTP-only cookies
       └─ Mongoose → MongoDB (User and Url collections)
```

The React client uses React Query for session state, mutations, and the user's saved links. Express keeps HTTP handling in controllers, URL/auth business rules in services, and MongoDB access in DAOs.

## Features

- Signup and login using username/email and password
- HTTP-only access and refresh-token cookies
- Protected link creation, link listing, and link deletion
- Public redirects with click-count tracking
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

Example authenticated creation request:

```json
{ "originalUrl": "https://example.com/article" }
```

## Setup

1. Copy [`backend/.env.example`](backend/.env.example) to `backend/.env` and add a MongoDB connection string and JWT secrets.
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

The app has a functional authenticated UI and integrated backend. Automated tests have intentionally not been added yet.
