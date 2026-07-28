const express = require('express');
const {verifyjwt}=require("../middlewares/auth.middleware")
const shortUrlController = require('../controllers/shorturl.controller');
const asyncHandler = require('../utils/asyncHandler');
const router=express.Router();

router.post("/api/url/create",verifyjwt, asyncHandler(shortUrlController.createShortUrl));
router.get("/api/:shortUrl", asyncHandler(shortUrlController.redirectShortUrl));
router.get("/api/url/myurls",verifyjwt,)

module.exports=router;
