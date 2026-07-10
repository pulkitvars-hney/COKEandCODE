const createurlservice=require("../services/shorturlhelper.service")
const ApiError = require("../utils/ApiError");
async function createShortUrl(req,res){
    const {originalUrl}=req.body;
    // const originalUrl=req.body; 
    //! doing this i will store the whole object in the database and i will not be able to access the originalUrl property of the object 
    // !because it will be stored as an object in the database and i will have to access it as originalUrl.originalUrl which is not what i want
    // ! so i will destructure the object and get the originalUrl property from it
    //* originalurl will conatin{ "originalurl":"the url"} and when i try to insert it in if will have error because i have marked original uri as a string
    
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
