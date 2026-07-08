const express = require('express');
const shortUrlController = require('../controllers/shorturl.controller');
const router=express.Router();

router.post("/api/create/check", shortUrlController.createShortUrl);
router.get("/api/:shortUrl", shortUrlController.redirectShortUrl);


module.exports=router;
