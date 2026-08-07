const { CreateShortUrlwithuser, GetOriginalUrl } = require("../services/shorturlhelper.service")
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse")
const { getMyUrls, deleteUrlService } = require("../services/shorturlhelper.service")
const AnalyticsService = require("../services/analytic.service");
const UAParser = require("ua-parser-js");
const crypto = require("crypto");
const { getLocationFromIp } = require("../utils/geoip.helper");
async function createShortUrl(req, res) {
    const { originalUrl, alias } = req.body;
    // `req.body` is an object such as { originalUrl: "https://example.com" }.
    // Destructuring extracts the string that the URL schema expects to store.
    // Passing `req.body` directly would store an object and require `originalUrl.originalUrl` later.
    const shortUrl = await CreateShortUrlwithuser(originalUrl, req.user._id, alias);

    res.status(201).json({
        shortUrl
    });
}

async function redirectShortUrl(req, res) {
    const { shortUrl } = req.params;
    const url = await GetOriginalUrl(shortUrl);

    if (!url) {
        throw new ApiError(404, "Short URL not found");
    }

    const userAgent = req.get("user-agent") || "";
    const parsedUserAgent = UAParser(userAgent);
    const ipAddress = req.ip || req.socket.remoteAddress || "";
    const location = await getLocationFromIp(ipAddress);
    const visitorId = crypto
        .createHash("sha256")
        .update(`${ipAddress}:${userAgent}`)
        .digest("hex");

    await AnalyticsService.logClick(url, {
        ipAddress,
        userAgent,
        browser: parsedUserAgent.browser.name || "Unknown",
        os: parsedUserAgent.os.name || "Unknown",
        deviceType: parsedUserAgent.device.type || "desktop",
        referrer: req.get("referer") || "",
        visitorId,
        ...location,
    });

    res.redirect(url.originalUrl);
}

async function fetchingmyurls(req, res) {
    const urls = await getMyUrls(req.user._id);
    return res.status(200).json(new ApiResponse(200, urls, "Urls Fetched succesfully"));
}

async function deletingmyurl(req, res) {
    const response = await deleteUrlService(req.params.id, req.user._id);
    return res.status(200).json(new ApiResponse(200, response, "Deltion successful"))
}

module.exports = { createShortUrl, redirectShortUrl, fetchingmyurls, deletingmyurl };
