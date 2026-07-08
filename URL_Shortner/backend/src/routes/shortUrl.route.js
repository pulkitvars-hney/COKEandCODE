const express = require('express');
const shortUrlController = require('../controllers/shorturl.controller');
const router=express.Router();

router.post("/check", shortUrlController.createShortUrl);
module.exports=router;