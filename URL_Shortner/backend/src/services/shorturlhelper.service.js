const nanoid = require("../utils/nanoid.js");
const urlSchema = require("../models/url.models.js");
const saveurl=require("../DAo/url.dao.js")
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

module.exports={CreateShortUrlwithuser, GetOriginalUrl,CreateShortUrlwithoutuser,getMyUrls};
