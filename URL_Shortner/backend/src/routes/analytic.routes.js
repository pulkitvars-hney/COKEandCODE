const express = require("express");
const { getOverview, getRecentClicks } = require("../controllers/analytic.controller");
const { verifyjwt } = require("../middlewares/auth.middleware");
const router = express.Router();

router.get("/:urlId/overview", verifyjwt, getOverview);
// Optional `limit` query parameter defaults to 20 and is capped at 100.
router.get("/:urlId/recent", verifyjwt, getRecentClicks);

module.exports = router;
