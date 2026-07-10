const express = require('express');
const shortUrlController = require('../controllers/shorturl.controller');
const asyncHandler = require('../utils/asyncHandler');
const router=express.Router();

router.post("/api/create/check", asyncHandler(shortUrlController.createShortUrl));
router.get("/api/:shortUrl", asyncHandler(shortUrlController.redirectShortUrl));


module.exports=router;
