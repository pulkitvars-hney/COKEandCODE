const AnalyticDao = require("../DAo/analytic.DAO");
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

    // Aggregation pipelines do not cast strings to ObjectIds automatically.
    // Use the loaded URL document's ObjectId so analytics records match.
    const analyticsUrlId = url._id;
    const [countryStats, browserStats, deviceStats, osStats, uniqueVisitors, repeatVisitors, timeline] = await Promise.all([
        AnalyticDao.getAnalyticsStats(analyticsUrlId, "country"),
        AnalyticDao.getAnalyticsStats(analyticsUrlId, "browser"),
        AnalyticDao.getAnalyticsStats(analyticsUrlId, "deviceType"),
        AnalyticDao.getAnalyticsStats(analyticsUrlId, "os"),
        AnalyticDao.getUniqueVisitors(analyticsUrlId),
        AnalyticDao.getRepeatVisitors(analyticsUrlId),
        AnalyticDao.getTimeline(analyticsUrlId, timelineFormat)
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

const getRecentClicks = async (urlId, userId, limit = 20) => {
    // Load the URL first so a user cannot read analytics for someone else's link.
    const url = await UrlDao.getUrlById(urlId);
    if (!url) {
        throw new ApiError(404, "Url not found");
    }
    if (String(url.userId) !== String(userId)) {
        throw new ApiError(403, "you are not authorized to view analytics for this url");
    }

    const parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
        throw new ApiError(400, "limit must be a positive integer");
    }

    // Prevent a single request from returning an unbounded analytics history.
    const recentClicks = await AnalyticDao.getRecentClicks(url._id, Math.min(parsedLimit, 100));

    // Keep the API response stable even if an older analytics record lacks a field.
    return recentClicks.map((click) => ({
        timestamp: click.clickedAt,
        browser: click.browser || "Unknown",
        os: click.os || "Unknown",
        device: click.deviceType || "Unknown",
        country: click.country || null,
        city: click.city || null,
        referrer: click.referrer || null,
    }));
};

module.exports = { logClick, getOverview, getRecentClicks };
