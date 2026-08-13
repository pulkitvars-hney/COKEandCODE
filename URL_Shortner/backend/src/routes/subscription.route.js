const express = require("express");

const router = express.Router();

const { verifyjwt } = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");

const {
    getCurrentSubscription,
    getSubscriptionHistory,
    upgradeSubscriptionController
} = require("../controllers/subscription.controller");

router.get("/api/subscription/current",
    verifyjwt,
    asyncHandler(getCurrentSubscription)
);

router.get("/api/subscription/history",
    verifyjwt,
    asyncHandler(getSubscriptionHistory)
);

router.post(
    "/api/subscription/upgrade",
    verifyjwt,
    asyncHandler(upgradeSubscriptionController)
);

module.exports = router;