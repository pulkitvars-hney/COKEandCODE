const nanoid = require("../utils/nanoid.js");
const urlSchema = require("../models/models.js");
const saveurl=require("../DAo/saveurl.js")
const CreateShortUrlwithoutuser = async (url) => {
    const short_Url = nanoid.genratenanoid(7);
    await saveurl.saveshortUrl(short_Url,url)
    return process.env.APP_KEY + short_Url;

}
const CreateShortUrlwithuser = async (url,userid) => {
    const short_Url = nanoid.genratenanoid(7);
    await saveurl.saveshortUrl(short_Url,url,userID)
    return process.env.APP_KEY + short_Url;

}

const GetOriginalUrl = async (shortUrl) => {
    return urlSchema.findOneAndUpdate({ shortUrl },{$inc:{clicks:1}});
}

module.exports={CreateShortUrlwithuser, GetOriginalUrl,CreateShortUrlwithoutuser};
