const express = require("express");
const { getOverview, getRecentClicks } = require("../controllers/analytic.controller");
const { verifyjwt } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
    analyticsUrlIdParamsSchema,
    analyticsOverviewQuerySchema,
    recentClicksQuerySchema,
} = require("../validators/request.validators");
const router = express.Router();

router.get("/:urlId/overview", verifyjwt, validate(analyticsUrlIdParamsSchema, "params"), validate(analyticsOverviewQuerySchema, "query"), getOverview);
router.get("/:urlId/recent", verifyjwt, validate(analyticsUrlIdParamsSchema, "params"), validate(recentClicksQuerySchema, "query"), getRecentClicks);

module.exports = router;
