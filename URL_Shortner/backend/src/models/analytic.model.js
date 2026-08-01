const mongoose = require("mongoose");

const analyticSchema = new mongoose.Schema({
    urlid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Url",
        required: true,
        index: true,
    },
    userid: {
        type:String,
        index: true,
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    browser: {
        type: String,
    },
    os: {
        type: String,
    },
    deviceType: {
        type: String,
    },
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    refers: {
        type: String,
    },
    visitorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        index: true,

    },
    clickedAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true })
analyticSchema.index({
    urlId: 1,
    clickedAt: -1,
})
module.exports=mongoose.model("analytics",analyticSchema);