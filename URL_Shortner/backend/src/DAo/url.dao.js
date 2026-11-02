const urlschema = require("../models/url.models.js");

const saveshortUrl = async (shorturl, longurl, userId, expiresAt, plan,
    subscriptionId, session) => {
    const newurl = new urlschema({
        originalUrl: longurl,
        shortUrl: shorturl,
        expiresAt,
        plan,
        subscriptionId
    })
    if (userId) {
        newurl.userId = userId;
    }
    return await newurl.save({ session });

};

const getUrlsByUserId = async (userId) => {
    return await urlschema.find({ userId });
};

const getUrlById = async (Id, session) => {
    return await urlschema.findById(Id).session(session);
};

const findByShortUrl = async (shortUrl, session = null) => {
    return await urlschema.findOne({ shortUrl }).session(session);
};

const deleteUrl = async (Id, userId, session) => {
    return await urlschema.findOneAndUpdate(
        {
            _id: Id,
            userId,
            status: "active"
        },
        {
            $set: { status: "deleted" }
        },
        {
            session,
            returnDocument: "after"
        }
    );
};

const expireUrl=async (Id,session)=>{
    return await urlschema.findOneAndUpdate(
        {
            _id: Id,
            status: "active"
        },
        {
            $set: { status: "expired" }
        },
        {
            session,
            returnDocument: "after"
        }
    );
};

const countActiveUrlsByUser = async (userId) => {
    return await urlschema.countDocuments({
        userId: userId,
        status:"active",
        expiresAt: { $gt: new Date() }
    });// needs one filter object, and inside that object we're giving it two conditions:
};

const findexpiredActiveUrls=async()=>{
    return await urlschema.find({
        status:"active",
        expiresAt: { $lt: new Date() }
    });
};

const acquireQrCodeGeneration = async (id, userId, token, startedAt, staleBefore) => {
    return urlschema.findOneAndUpdate(
        {
            _id: id,
            userId,
            $or: [
                { qrCodeGeneration: { $exists: false } },
                { "qrCodeGeneration.startedAt": { $lt: staleBefore } },
            ],
        },
        { $set: { qrCodeGeneration: { token, startedAt } } },
        { returnDocument: "after" }
    );
};

const saveQrCode = async (id, userId, token, qrCode) => {
    return urlschema.findOneAndUpdate(
        { _id: id, userId, "qrCodeGeneration.token": token },
        {
            $set: { qrCode },
            $unset: { qrCodeGeneration: "" },
        },
        { returnDocument: "after" }
    );
};

const isQrCodeGenerationLockHeld = async (id, userId, token) => {
    return Boolean(await urlschema.exists({
        _id: id,
        userId,
        "qrCodeGeneration.token": token,
    }));
};

const releaseQrCodeGeneration = async (id, userId, token) => {
    return urlschema.updateOne(
        { _id: id, userId, "qrCodeGeneration.token": token },
        { $unset: { qrCodeGeneration: "" } }
    );
};

const acquireStyledQrCodeGeneration = async (id, userId, token, startedAt, staleBefore) => {
    return urlschema.findOneAndUpdate(
        { _id: id, userId, $or: [{ styledQrCodeGeneration: { $exists: false } }, { "styledQrCodeGeneration.startedAt": { $lt: staleBefore } }] },
        { $set: { styledQrCodeGeneration: { token, startedAt } } },
        { returnDocument: "after" }
    );
};

const saveStyledQrCode = async (id, userId, token, styledQrCode) => {
    return urlschema.findOneAndUpdate(
        { _id: id, userId, "styledQrCodeGeneration.token": token },
        { $set: { styledQrCode }, $push: { styledQrCodes: styledQrCode }, $unset: { styledQrCodeGeneration: "" } },
        { returnDocument: "after" }
    );
};

const hasStyledQrCodeLock = async (id, userId, token) => Boolean(await urlschema.exists({ _id: id, userId, "styledQrCodeGeneration.token": token }));

const releaseStyledQrCodeGeneration = async (id, userId, token) => {
    return urlschema.updateOne({ _id: id, userId, "styledQrCodeGeneration.token": token }, { $unset: { styledQrCodeGeneration: "" } });
};

const upgradeUrlById = async (urlId, userId, setData, session) => {
    // findOneAndUpdate, not findByIdAndUpdate: the filter is a condition
    // object (owner + eligibility), and findByIdAndUpdate would wrap the
    // entire object as the _id value instead of applying each condition.
    return await urlschema.findOneAndUpdate(
        {
            _id: urlId,
            userId,
            plan: "free",
            status: "active",
            expiresAt: { $gt: new Date() },
        },
        {
            $set: setData,
        },
        {   session,
            returnDocument: "after",
        }
    );
};

// Only unexpired Free URLs of this owner are selectable for promotion.
// Already-Pro URLs and other users' URLs can never match the filter.
const upgradeFreeUrlsByUserId = async (userId, setData,session) => {
    return await urlschema.updateMany(
        {
            userId,
            plan: "free",
            status:"active",
            expiresAt: { $gt: new Date() },
        },
        {
            $set: setData,
        },{
            session,
            returnDocument:"after",
        },
    );
};

module.exports = {
    saveshortUrl,
    getUrlsByUserId,
    getUrlById,
    findByShortUrl,
    deleteUrl,
    expireUrl,
    countActiveUrlsByUser,
    upgradeUrlById,
    upgradeFreeUrlsByUserId,
    findexpiredActiveUrls,
    acquireQrCodeGeneration,
    saveQrCode,
    isQrCodeGenerationLockHeld,
    releaseQrCodeGeneration,
    acquireStyledQrCodeGeneration,
    saveStyledQrCode,
    hasStyledQrCodeLock,
    releaseStyledQrCodeGeneration,
};
