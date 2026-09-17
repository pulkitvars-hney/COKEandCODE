const nanoid = require("../utils/nanoid.js");
const urlSchema = require("../models/url.models.js");
const saveurl = require("../DAo/url.dao.js");
const ApiError = require("../utils/ApiError.js");
const { RESERVED_ALIASES } = require("../constant/reservedAliases");
const { createDefaultSubscription, currentSubscription } = require("../services/subscription.service.js")

const mongoose = require("mongoose");
const userDao = require("../DAo/user.dao.js");

const validateUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) {
        throw new ApiError(400, "originalUrl is required");
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(value.trim());
    } catch {
        throw new ApiError(400, "Please provide a valid URL");
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new ApiError(400, "Only HTTP and HTTPS URLs are supported");
    }
    return parsedUrl.toString();
};

const buildShortUrl = (shortCode) => {
    const baseUrl = process.env.APP_KEY || `http://localhost:${process.env.PORT || 3000}/api/`;
    return `${baseUrl.replace(/\/?$/, "/")}${shortCode}`;
};

const createUniqueShortCode = async (url, userId, expiresAt, plan,
    subscriptionId, session) => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const shortCode = nanoid.genratenanoid(7);
        try {
            await saveurl.saveshortUrl(shortCode, url, userId, expiresAt, plan,
                subscriptionId, session);
            return shortCode;
        } catch (error) {
            if (error?.code !== 11000) throw error;
        }
    }
    throw new ApiError(500, "Unable to generate a unique short URL");
};

// const CreateShortUrlwithoutuser = async (url) => {
//     const normalizedUrl = validateUrl(url);
//     const shortCode = await createUniqueShortCode(normalizedUrl);
//     return buildShortUrl(shortCode);

// }

const CreateShortUrlwithuser = async (url, userid, alias) => {
    //validation of url and alias
    const normalizedUrl = validateUrl(url);
    const subscription = await currentSubscription(userid);
    let expiresAt;
    let subscriptionId = null;

    const normalizedAlias = alias?.trim().toLowerCase();
    // Determine the expiration date based on the user's subscription plan
    if (subscription.plan === "free") {

        expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );
    } else if (subscription.plan === "pro") {
        subscriptionId = subscription._id;
        expiresAt = new Date(subscription.currentPeriodEnd);

        expiresAt.setDate(expiresAt.getDate() + 3);
    }

    // =============================
    // PRO PLAN 
    // =============================

    if (subscription.plan === "pro") {

        //============================
        //PRO +CUSTOM ALIAS


        if (normalizedAlias) {
            if (RESERVED_ALIASES.has(normalizedAlias)) {
                throw new ApiError(400, "This alias is reserved");
            }

            const existingAlias = await saveurl.findByShortUrl(normalizedAlias);

            if (existingAlias) {
                throw new ApiError(409, "This alias is already in use");
            }

            try {
                await saveurl.saveshortUrl(normalizedAlias, normalizedUrl, userid, expiresAt, subscription.plan, subscriptionId, session);
            } catch (error) {
                // Protect against two requests claiming the same alias concurrently.
                if (error?.code === 11000) {
                    throw new ApiError(409, "This alias is already in use");
                }
                throw error;
            }
            return buildShortUrl(normalizedAlias);
        }

        // ===============================
        // PRO + AUTO GENERATED ALIAS
        //================================
        const existingUrl = await urlSchema.findOne({
            originalUrl: normalizedUrl,
            userId: userid,
            expiresAt: { $gt: new Date() }
        });
        if (existingUrl) {
            return buildShortUrl(existingUrl.shortUrl);
        }
        const shortCode = await createUniqueShortCode(
            normalizedUrl,
            userid,
            expiresAt,
            subscription.plan,
            subscriptionId
        );

        return buildShortUrl(shortCode);



    }
    //=====================================
    // FREE PLAN
    //===================================== 
    if (subscription.plan === "free") {
        const session = await mongoose.startSession();
        try {
            await session.startTransaction();

            //==============================
            //resreve free url slot for user
            //==============================

            const reservedUser = await userDao.reserveFreeUrlSlot(
                userid,
                session
            );
            if (!reservedUser) {
                throw new ApiError(
                    403,
                    "Free URL limit reached. Upgrade to Pro for more URLs"
                );
            }

            //==============================
            // free+custom AllIAS
            //=============================

            if (normalizedAlias) {
                if (RESERVED_ALIASES.has(normalizedAlias)) {
                    throw new ApiError(400, "This alias is reserved");
                }
                const existingAlias = await saveurl.findByShortUrl(
                    normalizedAlias
                );
                if (existingAlias) {
                    throw new ApiError(409, "This alias is already in use");
                }
                try {
                    await saveurl.saveshortUrl(
                        normalizedAlias,
                        normalizedUrl,
                        userid,
                        expiresAt,
                        subscription.plan,
                        subscriptionId,
                        session
                    );
                } catch (error) {
                    if (error?.code === 11000) {
                        throw new ApiError(409, "This alias is already in use");
                    }
                    throw error;
                }
                await session.commitTransaction();
                return buildShortUrl(normalizedAlias);
            }
            //===============================
            // free+auto generated alias
            //===============================
            const existingUrl =
                await urlSchema.findOne(
                    {
                        originalUrl: normalizedUrl,
                        userId: userid,
                        expiresAt: { $gt: new Date() }
                    },
                    null,
                    { session }
                );
            if (existingUrl) {

                // We reserved a slot but
                // didn't create a URL.
                // Roll it back.

                await session.abortTransaction();

                return buildShortUrl(
                    existingUrl.shortUrl
                );
            }
            const shortCode =
                await createUniqueShortCode(
                    normalizedUrl,
                    userid,
                    expiresAt,
                    subscription.plan,
                    subscriptionId,
                    session
                );

            // =================================
            // COMMIT
            // =================================

            await session.commitTransaction();

            return buildShortUrl(shortCode);

        } catch (error) {

            await session.abortTransaction();
            throw error;

        } finally {

            session.endSession();
        }
    }
}

const GetOriginalUrl = async (shortUrl) => {
    return urlSchema.findOneAndUpdate({ shortUrl, status: "active", expiresAt: { $gt: new Date() } }, { $inc: { clicks: 1 } }, { new: true });
};

const getMyUrls = async (userId) => {
    const urls = await saveurl.getUrlsByUserId(userId);
    return urls.map((url) => ({
        ...url.toObject(),
        shortCode: url.shortUrl,
        shortUrl: buildShortUrl(url.shortUrl),
    }));
}

const deleteUrlService = async (id, userid) => {

    const session = await mongoose.startSession();

    try {
        await session.startTransaction();
        const url = await saveurl.getUrlById(id, session);
        if (!url) {
            throw new ApiError(404, "No url found");
        }
        //url.userId is a MongoDB ObjectId, while userid may also be an ObjectId. 
        //Comparing them with !== usually returns true even if they represent the same value
        if (url.userId.toString() !== userid.toString()) {
            throw new ApiError(403, "Access forbidden");
        }
        const deletedurl = await saveurl.deleteUrl(id, userid, session);
        if (!deletedurl) {
            throw new ApiError(409, "Url is already deleted");
        }
        if (deletedurl.plan === "free") {
            const releasedUser = await userDao.releaseFreeUrlSlot(
                userid,
                session
            );

            if (!releasedUser) {
                throw new ApiError(
                    500,
                    "Unable to release Free URL slot"
                );
            }
        }

        await session.commitTransaction();
        return deletedurl;

    } catch (error) {

        await session.abortTransaction();
        throw error;

    } finally {

        session.endSession();
    }
}

const expireUrlService = async (id) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();
        const expireUrl = await saveurl.expireUrl(id, session);
        if (!expireUrl) {
            await session.abortTransaction();
            return null;
        }
        if (expireUrl.plan === "free") {
            const releasedUser = await userDao.releaseFreeUrlSlot(expireUrl.userId, session);
            if (!releasedUser) {
                throw new ApiError(500, "Unable to release Free URL slot");
            }
        }
        await session.commitTransaction();
        return expireUrl;

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;

    } finally {

        await session.endSession();

    }
}

module.exports = { CreateShortUrlwithuser, GetOriginalUrl, getMyUrls, deleteUrlService, buildShortUrl,expireUrlService };