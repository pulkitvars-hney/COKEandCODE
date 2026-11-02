const { z } = require("zod");

// Mongoose raises a CastError for malformed ObjectIds. Validate them first so
// callers receive a clear 400 response instead of an internal-server error.
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid URL id");

const createUrlSchema = z.object({
    originalUrl: z.string().trim().min(1, "originalUrl is required"),
    alias: z.string()
        .trim()
        .min(3, "Alias must be at least 3 characters long")
        .max(30, "Alias must be at most 30 characters long")
        .regex(/^[a-zA-Z0-9_-]+$/, "Alias can only contain letters, numbers, hyphens and underscores")
        .optional(),
});

const urlIdParamsSchema = z.object({
    id: objectId,
});

const styledQrCodeSchema = z.object({
    prompt: z.string().trim().max(160, "Prompt must be 160 characters or fewer").optional().default(""),
    style: z.enum(["minimal", "geometric", "nature", "abstract"]).optional().default("minimal"),
    foregroundColor: z.string().regex(/^#[a-f\d]{6}$/i, "foregroundColor must be a hex color").optional().default("#111827"),
    backgroundColor: z.string().regex(/^#[a-f\d]{6}$/i, "backgroundColor must be a hex color").optional().default("#FFFFFF"),
}).strict();

// Account upgrade is the only supported plan change until payments exist.
// A missing or arbitrary plan previously replaced subscriptions silently.
const upgradeSubscriptionSchema = z.object({
    plan: z.literal("pro", {
        message: "plan must be 'pro'",
    }),
});

const analyticsUrlIdParamsSchema = z.object({
    urlId: objectId,
});

const analyticsOverviewQuerySchema = z.object({
    interval: z.enum(["day", "week", "month", "year"]).default("day"),
});

const recentClicksQuerySchema = z.object({
    // Query values are strings. Only decimal digits are accepted before converting.
    limit: z.preprocess(
        (value) => typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value,
        z.number().int("limit must be an integer").min(1, "limit must be at least 1").max(100, "limit must be at most 100")
    ).default(20),
});

module.exports = {
    createUrlSchema,
    urlIdParamsSchema,
    upgradeSubscriptionSchema,
    analyticsUrlIdParamsSchema,
    analyticsOverviewQuerySchema,
    recentClicksQuerySchema,
    styledQrCodeSchema,
};
