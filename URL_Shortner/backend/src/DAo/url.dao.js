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

const findByShortUrl = async (shortUrl) => {
    return await urlschema.findOne({ shortUrl });
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
        expiresAt: { $gt: new Date() }
    });// needs one filter object, and inside that object we're giving it two conditions:
};

const findexpiredActiveUrls=async(userId)=>{
    return await urlschema.find({
        userId:userId,
        status:"active",
        expiresAt: { $lt: new Date() }
    });
};

const updateProUrlExpiry = async (subscriptionId, expiresAt) => {
    return await urlschema.updateMany(
        {
            subscriptionId,
            plan: "pro",
        },
        {
            $set: {
                expiresAt,
            },
        }
    );
};

const upgradeUrlById = async (urlId, setData) => {
    return await urlschema.findByIdAndUpdate(
        urlId,
        {
            $set: setData,
        },
        {
            returnDocument: "after",
        }
    );
};

// Only unexpired Free URLs of this owner are selectable for promotion.
// Already-Pro URLs and other users' URLs can never match the filter.
const upgradeFreeUrlsByUserId = async (userId, setData) => {
    return await urlschema.updateMany(
        {
            userId,
            plan: "free",
            expiresAt: { $gt: new Date() },
        },
        {
            $set: setData,
        }
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
    updateProUrlExpiry,
    upgradeUrlById,
    upgradeFreeUrlsByUserId,
    findexpiredActiveUrls
};