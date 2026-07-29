const nanoid = require("../utils/nanoid.js");
const urlSchema = require("../models/url.models.js");
const saveurl=require("../DAo/url.dao.js");
const ApiError = require("../utils/ApiError.js");

const validateUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) {
        throw new ApiError(400, "originalUrl is required");
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(value.trim());
    } catch {
        throw new ApiError(400, "Please provide a valid URL");
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new ApiError(400, "Only HTTP and HTTPS URLs are supported");
    }
    return parsedUrl.toString();
};

const buildShortUrl = (shortCode) => {
    const baseUrl = process.env.APP_KEY || `http://localhost:${process.env.PORT || 3000}/api/`;
    return `${baseUrl.replace(/\/?$/, "/")}${shortCode}`;
};

const createUniqueShortCode = async (url, userId) => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const shortCode = nanoid.genratenanoid(7);
        try {
            await saveurl.saveshortUrl(shortCode, url, userId);
            return shortCode;
        } catch (error) {
            if (error?.code !== 11000) throw error;
        }
    }
    throw new ApiError(500, "Unable to generate a unique short URL");
};

const CreateShortUrlwithoutuser = async (url) => {
    const normalizedUrl = validateUrl(url);
    const shortCode = await createUniqueShortCode(normalizedUrl);
    return buildShortUrl(shortCode);

}

const CreateShortUrlwithuser = async (url,userid) => {
    const normalizedUrl = validateUrl(url);
    const existingUrl = await urlSchema.findOne({ originalUrl: normalizedUrl, userId: userid });
    if (existingUrl) return buildShortUrl(existingUrl.shortUrl);

    const shortCode = await createUniqueShortCode(normalizedUrl, userid);
    return buildShortUrl(shortCode);

}

const GetOriginalUrl = async (shortUrl) => {
    return urlSchema.findOneAndUpdate({ shortUrl },{$inc:{clicks:1}});
}

const getMyUrls=async(userId)=>{
    const urls=await saveurl.getUrlsByUserId(userId);
    return urls.map((url) => ({
        ...url.toObject(),
        shortCode: url.shortUrl,
        shortUrl: buildShortUrl(url.shortUrl),
    }));
}

const deleteUrlService=async(id,userid)=>{
    const url=await saveurl.getUrlById(id);
    if(!url){
        throw new ApiError(404,"No url found");
    }
    //url.userId is a MongoDB ObjectId, while userid may also be an ObjectId. 
    //Comparing them with !== usually returns true even if they represent the same value
    if(url.userId.toString()!==userid.toString()){
        throw new ApiError(403,"Access forbidden");
    }
    const deleteurl=await saveurl.deletUrl(id,userid)
    return deleteurl;
}
module.exports={CreateShortUrlwithuser, GetOriginalUrl,CreateShortUrlwithoutuser,getMyUrls,deleteUrlService};
