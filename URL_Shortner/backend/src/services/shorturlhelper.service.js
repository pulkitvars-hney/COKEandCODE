const nanoid = require("../utiles/nanoid.js");
const urlSchema = require("../models/models.js");

const CreateShortUrl = async (url) => {
    const short_Url = nanoid.genratenanoid(7);
    const newurl=new urlSchema({
        originalUrl:url,
        shortUrl:short_Url,
    })
    await newurl.save();
    return process.env.APP_KEY + short_Url;

}

const GetOriginalUrl = async (shortUrl) => {
    return urlSchema.findOne({ shortUrl });
}

module.exports={CreateShortUrl, GetOriginalUrl};
