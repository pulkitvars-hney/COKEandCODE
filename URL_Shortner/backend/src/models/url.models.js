const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema({
    publicId: { type: String },
    url: { type: String },
    format: { type: String },
    shortUrl: { type: String },
    generatedAt: { type: Date },
}, { _id: false });

const qrCodeGenerationSchema = new mongoose.Schema({
    token: { type: String },
    startedAt: { type: Date },
}, { _id: false });

const styledQrCodeSchema = new mongoose.Schema({
    publicId: { type: String },
    url: { type: String },
    format: { type: String },
    shortUrl: { type: String },
    style: { type: String },
    prompt: { type: String },
    foregroundColor: { type: String },
    backgroundColor: { type: String },
    generatedAt: { type: Date },
}, { _id: false });

const urlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    clicks: {
        type: Number,
        required: true,
        default: 0,

    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
    },
    status: {
        type: String,
        enum: ["active", "expired", "deleted"],
        default: "active",
        required: true,
        index: true,
    },
    plan: {
        type: String,
        enum: ["free", "pro"],
        required: true,
    },

    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subscription",
        default: null,
    },
    expiresAt: {
        type: Date,
        default: null,
        index: true,
    },
    // QR assets are generated server-side for an owned, active short URL.
    // Keep provider metadata separate from the redirect and lifecycle fields.
    qrCode: {
        type: qrCodeSchema,
        default: null,
    },
    // This transient lease prevents concurrent QR requests from overwriting the
    // same deterministic Cloudinary asset or persisting inconsistent metadata.
    qrCodeGeneration: {
        type: qrCodeGenerationSchema,
        default: undefined,
    },
    // Styled assets intentionally live separately so a failed or new style
    // never replaces the reliable standard QR code.
    styledQrCode: {
        type: styledQrCodeSchema,
        default: null,
    },
    styledQrCodeGeneration: {
        type: qrCodeGenerationSchema,
        default: undefined,
    }

}, { timestamps: true })

// Compound index for the every-minute expiry sweep and any {status, expiresAt}
// filter on active/unexpired URLs. The standalone status/expiresAt indexes stay
// (other queries filter each field with different leading keys).
urlSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model("Url", urlSchema);
