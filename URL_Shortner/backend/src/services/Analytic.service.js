const AnalyticDao = require("../DAo/Analytic.DAO");
const UrlDao = require("../DAo/url.dao");
const ApiError = require("../utils/ApiError");
const { dateFormat } = require("../utils/analytics.helper");

const logClick = async (url, analyticsData = {}) => {
    return AnalyticDao.createAnalytic({
        urlId: url._id,
        userId: url.userId,
        ...analyticsData,
    });
};
const getOverview = async (urlId, userId, interval = "day") => {
    const url = await UrlDao.getUrlById(urlId);
    if (!url) {
        throw new ApiError(404, "Url not found");
    }
    if (String(url.userId) !== String(userId)) {
        throw new ApiError(403, "you are not authorized to view analytics for this url");
    }
    const timelineFormat = dateFormat[interval];

    if (!timelineFormat) {
        throw new ApiError(400, "Invalid interval");
    }
    const [countryStats, browserStats, deviceStats, osStats, uniqueVisitors, repeatVisitors, timeline] = await Promise.all([
        AnalyticDao.getAnalyticsStats(urlId, "country"),
        AnalyticDao.getAnalyticsStats(urlId, "browser"),
        AnalyticDao.getAnalyticsStats(urlId, "deviceType"),
        AnalyticDao.getAnalyticsStats(urlId, "os"),
        AnalyticDao.getUniqueVisitors(urlId),
        AnalyticDao.getRepeatVisitors(urlId),
        AnalyticDao.getTimeline(urlId, timelineFormat)
    ]);
    return {
        totalClicks: url.clicks,
        uniqueVisitors: uniqueVisitors.length,
        repeatVisitors: repeatVisitors.length > 0
        ? repeatVisitors[0].repeatVisitors
        : 0,
        timeline,
        countryStats,
        browserStats,
        deviceStats,
        osStats,
    };
};

module.exports = { logClick, getOverview };
