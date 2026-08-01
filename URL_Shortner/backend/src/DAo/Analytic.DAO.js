const Analytics = require("../models/analytic.model");
const { getAnalyticsStats } = require("../utils/analytics.helper")
const createAnalytic = async (data) => {
    return await Analytics.create(data);
};

const getRecentClicks = async (urlId, limit = 20) => {
    // Return only the most recent 'limit' analytics documents.
    return await Analytics.find({ urlId }).sort({ clickedAt: -1, }).limit(limit)
    // -1 will help us to get data newest to oldest
}

const getCountryStats = async (urlId) => {
    return await getAnalyticsStats(urlId, "country");
}

const getBrowserStats = async (urlId) => {
    return await getAnalyticsStats(urlId, "browser");
}

const getDeviceStats = async (urlId) => {
    return await getAnalyticsStats(urlId, "deviceType");
}

const getOsStats = async (urlId) => {
    return await getAnalyticsStats(urlId, "os");

}

const getUniqueVisitors = async (urlId) => {
    return await Analytics.distinct("visitorId", { urlId });
};

const getTimeline = async (urlId, dateFormat) => {
    return await Analytics.aggregate([
        {
            $match:{urlId}

        },{
            $group:{
                _id:{
                    $dateToString:{
                        format:dateFormat,
                        date:"$clickedAt",
                    }
                },
                clicks:{
                    $sum:1,
                }
            }
        },{
            $sort:{
                _id:1,
            }
        }
    ])
}

const getRepeatVisitors = async (urlId) => {
    return await Analytics.aggregate([
        {
            $match:{urlId}
        },
        {
            $group:{
                _id:"$visitorId",
                count:{
                    $sum:1,
                }
            }
        },{
            $match:{
                count:{$gt:1}
            }
        },{
            $count:"repeatVisitors"
            //repeatedVisitors will be the number of visitors who have visited the same url more than once
        }
    ])
}

module.exports = {
    createAnalytic,
    getRecentClicks,
    getCountryStats,
    getDeviceStats,
    getBrowserStats,
    getOsStats,
    getUniqueVisitors,
    getTimeline,
};