const express = require('express');
const {verifyjwt}=require("../middlewares/auth.middleware")
const shortUrlController = require('../controllers/shorturl.controller');
const asyncHandler = require('../utils/asyncHandler');
const { validate } = require("../middlewares/validate.middleware");
const { createUrlSchema, urlIdParamsSchema } = require("../validators/request.validators");
const router=express.Router();

router.post("/api/url/create",verifyjwt, validate(createUrlSchema), asyncHandler(shortUrlController.createShortUrl));
router.get("/api/:shortUrl", asyncHandler(shortUrlController.redirectShortUrl));
router.get("/api/url/myurls",verifyjwt,asyncHandler(shortUrlController.fetchingmyurls))
router.delete("/api/url/:id",verifyjwt,validate(urlIdParamsSchema, "params"),asyncHandler(shortUrlController.deletingmyurl))
module.exports=router;
