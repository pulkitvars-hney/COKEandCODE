const nanoid = require("../utils/nanoid.js");
const urlSchema = require("../models/url.models.js");
const saveurl=require("../DAo/url.dao.js");
const ApiError = require("../utils/ApiError.js");

const CreateShortUrlwithoutuser = async (url) => {
    const short_Url = nanoid.genratenanoid(7);
    await saveurl.saveshortUrl(short_Url,url)
    return process.env.APP_KEY + short_Url;

}

const CreateShortUrlwithuser = async (url,userid) => {
    const short_Url = nanoid.genratenanoid(7);
    await saveurl.saveshortUrl(short_Url,url,userid)
    return process.env.APP_KEY + short_Url;

}

const GetOriginalUrl = async (shortUrl) => {
    return urlSchema.findOneAndUpdate({ shortUrl },{$inc:{clicks:1}});
}

const getMyUrls=async(userId)=>{
    const urls=await saveurl.getUrlsByUserId(userId);
    return urls;
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
