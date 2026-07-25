const createurlservice=require("../services/shorturlhelper.service")
const ApiError = require("../utils/ApiError");
async function createShortUrl(req,res){
    const {originalUrl}=req.body;
    // `req.body` is an object such as { originalUrl: "https://example.com" }.
    // Destructuring extracts the string that the URL schema expects to store.
    // Passing `req.body` directly would store an object and require `originalUrl.originalUrl` later.
    if (!originalUrl) {
        throw new ApiError(400, "originalUrl is required");
    }

    const shortUrl=await createurlservice.CreateShortUrlwithoutuser(originalUrl);
    
    res.status(201).json({shortUrl});
}

async function redirectShortUrl(req,res){
    const {shortUrl}=req.params;
    const url=await createurlservice.GetOriginalUrl(shortUrl);

    if(!url){
        throw new ApiError(404, "Short URL not found");
    }

    res.redirect(url.originalUrl);
}

module.exports={createShortUrl, redirectShortUrl};
