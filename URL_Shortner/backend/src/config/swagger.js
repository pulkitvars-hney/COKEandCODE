const swaggerJSDoc = require("swagger-jsdoc");

// Keep the API contract in one place so Swagger UI stays useful as the app grows.
const definition = {
    openapi: "3.0.3",
    info: {
        title: "Shortly API",
        version: "1.0.0",
        description: "API for creating short URLs, redirecting visitors, and viewing link analytics.",
    },
    servers: [{ url: "http://localhost:3000", description: "Local development" }],
    tags: [
        { name: "Authentication" },
        { name: "URLs" },
        { name: "Analytics" },
        { name: "Redirect" },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Use the access token returned at login. Browser clients may alternatively use the HTTP-only cookie.",
            },
        },
        schemas: {
            Credentials: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", format: "email", example: "user@example.com" },
                    password: { type: "string", format: "password", example: "password123" },
                },
            },
            SignupRequest: {
                allOf: [
                    { $ref: "#/components/schemas/Credentials" },
                    { type: "object", required: ["username"], properties: { username: { type: "string", example: "pulkit" } } },
                ],
            },
            CreateUrlRequest: {
                type: "object",
                required: ["originalUrl"],
                properties: { originalUrl: { type: "string", format: "uri", example: "https://example.com/article" } },
            },
            RecentClick: {
                type: "object",
                properties: {
                    timestamp: { type: "string", format: "date-time" },
                    browser: { type: "string", example: "Chrome" },
                    os: { type: "string", example: "Windows" },
                    device: { type: "string", example: "desktop" },
                    country: { type: "string", nullable: true, example: "India" },
                    city: { type: "string", nullable: true, example: "Delhi" },
                    referrer: { type: "string", nullable: true, example: "https://google.com" },
                },
            },
        },
    },
    paths: {
        "/api/auth/signup": {
            post: { tags: ["Authentication"], summary: "Create an account", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SignupRequest" } } } }, responses: { 201: { description: "Account created" }, 400: { description: "Invalid account details" } } },
        },
        "/api/auth/login": {
            post: { tags: ["Authentication"], summary: "Log in and receive auth cookies", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Credentials" } } } }, responses: { 200: { description: "Login successful" }, 401: { description: "Invalid credentials" } } },
        },
        "/api/auth/me": {
            get: { tags: ["Authentication"], summary: "Get the active user", security: [{ bearerAuth: [] }], responses: { 200: { description: "Current user" }, 401: { description: "Authentication required" } } },
        },
        "/api/auth/refresh-token": {
            post: { tags: ["Authentication"], summary: "Refresh authentication cookies", responses: { 200: { description: "Tokens refreshed" }, 401: { description: "Missing, invalid, or expired refresh token" } } },
        },
        "/api/auth/logout": {
            post: { tags: ["Authentication"], summary: "Log out", security: [{ bearerAuth: [] }], responses: { 200: { description: "Logged out" }, 401: { description: "Authentication required" } } },
        },
        "/api/url/create": {
            post: { tags: ["URLs"], summary: "Create a short URL", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateUrlRequest" } } } }, responses: { 201: { description: "Short URL created" }, 400: { description: "Invalid original URL" }, 401: { description: "Authentication required" } } },
        },
        "/api/url/myurls": {
            get: { tags: ["URLs"], summary: "List the current user's URLs", security: [{ bearerAuth: [] }], responses: { 200: { description: "Saved URLs" }, 401: { description: "Authentication required" } } },
        },
        "/api/url/{id}": {
            delete: { tags: ["URLs"], summary: "Delete an owned URL", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "URL deleted" }, 403: { description: "URL belongs to another user" }, 404: { description: "URL not found" } } },
        },
        "/api/{shortUrl}": {
            get: { tags: ["Redirect"], summary: "Redirect a short URL to its original destination", parameters: [{ name: "shortUrl", in: "path", required: true, schema: { type: "string" } }], responses: { 302: { description: "Redirected to original URL" }, 404: { description: "Short URL not found" } } },
        },
        "/api/analytics/{urlId}/overview": {
            get: { tags: ["Analytics"], summary: "Get overview analytics for an owned URL", security: [{ bearerAuth: [] }], parameters: [{ name: "urlId", in: "path", required: true, schema: { type: "string" } }, { name: "interval", in: "query", schema: { type: "string", enum: ["day", "week", "month", "year"], default: "day" } }], responses: { 200: { description: "Analytics overview" }, 403: { description: "URL belongs to another user" }, 404: { description: "URL not found" } } },
        },
        "/api/analytics/{urlId}/recent": {
            get: { tags: ["Analytics"], summary: "Get recent clicks for an owned URL", security: [{ bearerAuth: [] }], parameters: [{ name: "urlId", in: "path", required: true, schema: { type: "string" } }, { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } }], responses: { 200: { description: "Recent click events", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/RecentClick" } } } } }, 400: { description: "Invalid limit" }, 403: { description: "URL belongs to another user" }, 404: { description: "URL not found" } } },
        },
    },
};

module.exports = swaggerJSDoc({ definition, apis: [] });
