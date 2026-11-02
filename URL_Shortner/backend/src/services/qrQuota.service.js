const crypto = require("crypto");
const ApiError = require("../utils/ApiError");
const { FREE_QR_LIMIT } = require("../constant/freeQrLimit");
const { currentSubscription } = require("./subscription.service");
const { findByUserID, reserveFreeQrGeneration, completeFreeQrGeneration, releaseFreeQrGeneration } = require("../DAo/user.dao");

const reserveQrGeneration = async (userId) => {
    const subscription = await currentSubscription(userId);
    if (subscription.plan === "pro") return null;

    const reservationId = crypto.randomUUID();
    const reserved = await reserveFreeQrGeneration(userId, reservationId);
    if (!reserved) {
        throw new ApiError(403, `Free QR generation limit reached (${FREE_QR_LIMIT}). Upgrade to Pro for unlimited QR codes.`);
    }
    return reservationId;
};

const completeQrGeneration = async (userId, reservationId) => {
    if (!reservationId) return;
    const completed = await completeFreeQrGeneration(userId, reservationId);
    if (!completed) throw new Error("QR generation quota reservation was lost");
};

const releaseQrGeneration = async (userId, reservationId) => {
    if (reservationId) await releaseFreeQrGeneration(userId, reservationId);
};

const getQrGenerationUsage = async (userId) => {
    const subscription = await currentSubscription(userId);
    if (subscription.plan === "pro") return { plan: "pro", used: 0, limit: null, remaining: null };

    const user = await findByUserID(userId);
    const used = user?.qrGenerationCount || 0;
    const reserved = user?.qrGenerationReservations?.length || 0;
    return { plan: "free", used, limit: FREE_QR_LIMIT, remaining: Math.max(0, FREE_QR_LIMIT - used - reserved) };
};

module.exports = { reserveQrGeneration, completeQrGeneration, releaseQrGeneration, getQrGenerationUsage };
