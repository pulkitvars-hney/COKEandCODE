const {CreateShortUrlwithuser,GetOriginalUrl}=require("../services/shorturlhelper.service")
const ApiError = require("../utils/ApiError");
async function createShortUrl(req,res){
    const {originalUrl}=req.body;
    // `req.body` is an object such as { originalUrl: "https://example.com" }.
    // Destructuring extracts the string that the URL schema expects to store.
    // Passing `req.body` directly would store an object and require `originalUrl.originalUrl` later.
    if (!originalUrl) {
        throw new ApiError(400, "originalUrl is required");
    }

    const shortUrl=await CreateShortUrlwithuser(originalUrl,req.user._id);
    
    res.status(201).json({shortUrl});
}

async function redirectShortUrl(req,res){
    const {shortUrl}=req.params;
    const url=await GetOriginalUrl(shortUrl);

    if(!url){
        throw new ApiError(404, "Short URL not found");
    }

    res.redirect(url.originalUrl);
}

async function fetchingmyurls(req,res){
    const url=await getMyUrls(req.user._id);
    return res.status(200).json( new ApiResponse(200,urls,"Urls Fetched succesfully"));
}
module.exports={createShortUrl, redirectShortUrl,fetchingmyurls};
